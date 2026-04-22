import fs from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';

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

async function validateUserArchiveArg(archivePath) {
  if (path.extname(archivePath).toLowerCase() !== '.zip') {
    throw new Error(`Архив для --archive должен иметь расширение .zip: ${archivePath}`);
  }

  const present = await exists(archivePath);
  if (!present) {
    throw new Error(`Архив не найден: ${archivePath}`);
  }

  const stat = await fs.stat(archivePath);
  if (!stat.isFile()) {
    throw new Error(`Путь --archive не является файлом: ${archivePath}`);
  }
}

function extractZipToDir(archivePath, destinationDir) {
  const zip = new AdmZip(archivePath);
  zip.extractAllTo(destinationDir, true);
}

async function readBackupManifest(extractDir) {
  const manifestPath = path.join(extractDir, 'backup-manifest.json');
  if (!(await exists(manifestPath))) {
    return null;
  }
  try {
    const raw = await fs.readFile(manifestPath, 'utf8');
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
}

/** Сообщение о том, почему .env не перезаписан (или что он восстановлен). */
function logEnvRestoreOutcome(restored, manifest) {
  const envRestored = restored.includes('.env');
  if (envRestored) {
    console.log('.env восстановлен из архива.');
    return;
  }

  if (manifest && manifest.envIncluded === false) {
    console.log(
      'Примечание: в этом бэкапе не было .env (manifest.envIncluded=false, бэкап без --include-env). Локальный backend/.env не изменён.',
    );
    return;
  }

  if (manifest && manifest.envIncluded === true) {
    console.warn('В манифесте envIncluded=true, но файла .env в архиве нет; backend/.env не изменён.');
    return;
  }

  if (manifest && Array.isArray(manifest.included) && manifest.included.includes('.env')) {
    console.warn('В манифесте в списке included указан .env, но файла в архиве нет; backend/.env не изменён.');
    return;
  }

  console.log('Файл .env в архиве отсутствует; backend/.env не изменён.');
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
  const args = parseArgs(process.argv.slice(2));
  const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const archivePath = await resolveArchivePath(args, backendDir);

  if (args.archive) {
    await validateUserArchiveArg(archivePath);
  } else {
    const archiveExists = await exists(archivePath);
    if (!archiveExists) {
      throw new Error(`Архив не найден: ${archivePath}`);
    }
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
    extractZipToDir(archivePath, extractDir);
    const manifest = await readBackupManifest(extractDir);

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
    logEnvRestoreOutcome(restored, manifest);
  } finally {
    await fs.rm(extractDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error('Ошибка restore:', error.message);
  process.exit(1);
});
