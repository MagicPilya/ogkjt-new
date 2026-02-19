import fs from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    i += 1;
  }
  return parsed;
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function expandWithPowerShell(archivePath, destinationDir) {
  const command = `Expand-Archive -LiteralPath "${archivePath}" -DestinationPath "${destinationDir}" -Force`;

  await new Promise((resolve, reject) => {
    const child = spawn('powershell', ['-NoProfile', '-Command', command], {
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Expand-Archive завершился с кодом ${code}`));
      }
    });
  });
}

async function askForConfirmation(archivePath, backendDir) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(
    `Восстановление перезапишет данные в "${backendDir}" из архива "${archivePath}". Продолжить? (yes/no): `,
  );
  rl.close();
  return answer.trim().toLowerCase() === 'yes';
}

async function copyWithFriendlyError(source, destination, relativePath) {
  try {
    await fs.cp(source, destination, { recursive: true, force: true });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EBUSY') {
      throw new Error(
        `Файл занят другим процессом: ${relativePath}. Останови Strapi/Node (чтобы SQLite не был открыт) и повтори restore.`,
      );
    }
    throw error;
  }
}

async function resolveArchivePath(args, backendDir) {
  if (args.archive) {
    return path.resolve(process.cwd(), String(args.archive));
  }

  const backupsDir = path.join(backendDir, 'backups');
  const backupsDirExists = await exists(backupsDir);
  if (!backupsDirExists) {
    throw new Error('Папка backup не найдена. Укажи архив через --archive или сначала создай backup.');
  }

  const entries = await fs.readdir(backupsDir, { withFileTypes: true });
  const zipFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.zip'));
  if (zipFiles.length === 0) {
    throw new Error('В папке backend/backups нет .zip архивов для восстановления.');
  }

  const stats = await Promise.all(
    zipFiles.map(async (entry) => {
      const fullPath = path.join(backupsDir, entry.name);
      const stat = await fs.stat(fullPath);
      return { fullPath, mtimeMs: stat.mtimeMs };
    }),
  );

  stats.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return stats[0].fullPath;
}

async function main() {
  if (process.platform !== 'win32') {
    throw new Error('Этот скрипт рассчитан на Windows (PowerShell Expand-Archive).');
  }

  const args = parseArgs(process.argv.slice(2));
  const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const archivePath = await resolveArchivePath(args, backendDir);

  const archiveExists = await exists(archivePath);
  if (!archiveExists) {
    throw new Error(`Архив не найден: ${archivePath}`);
  }
  if (!args.archive) {
    console.log(`Архив не указан, выбран последний: ${archivePath}`);
  }

  if (!args.yes) {
    const confirmed = await askForConfirmation(archivePath, backendDir);
    if (!confirmed) {
      console.log('Восстановление отменено.');
      return;
    }
  }

  const extractDir = await fs.mkdtemp(path.join(os.tmpdir(), 'strapi-admin-restore-'));

  try {
    await expandWithPowerShell(archivePath, extractDir);

    const restoreTargets = ['.tmp/data.db', 'public/uploads', '.env'];
    const restored = [];

    for (const relativePath of restoreTargets) {
      const source = path.join(extractDir, relativePath);
      const sourceExists = await exists(source);
      if (!sourceExists) {
        continue;
      }

      const destination = path.join(backendDir, relativePath);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await copyWithFriendlyError(source, destination, relativePath);
      restored.push(relativePath);
    }

    console.log('Восстановление завершено.');
    console.log(`Восстановлено: ${restored.length ? restored.join(', ') : 'ничего (архив пустой или другой формат)'}`);
  } finally {
    await fs.rm(extractDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error('Ошибка restore:', error.message);
  process.exit(1);
});
