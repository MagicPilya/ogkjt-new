import fs from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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

function timestampForFileName() {
  const now = new Date();
  const pad = (v) => String(v).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function compressWithPowerShell(sourceDir, archivePath) {
  const command = `Compress-Archive -Path "${sourceDir}\\*" -DestinationPath "${archivePath}" -Force`;

  await new Promise((resolve, reject) => {
    const child = spawn('powershell', ['-NoProfile', '-Command', command], {
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Compress-Archive завершился с кодом ${code}`));
      }
    });
  });
}

async function main() {
  if (process.platform !== 'win32') {
    throw new Error('Этот скрипт рассчитан на Windows (PowerShell Compress-Archive).');
  }

  const args = parseArgs(process.argv.slice(2));
  const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const defaultArchiveName = `admin-backup-${timestampForFileName()}.zip`;
  const outArg = args.out ? String(args.out) : path.join(backendDir, 'backups', defaultArchiveName);
  const outPath = path.resolve(process.cwd(), outArg);
  const stagingDir = await fs.mkdtemp(path.join(os.tmpdir(), 'strapi-admin-backup-'));

  const backupItems = [
    { relativePath: '.tmp/data.db', required: false },
    { relativePath: 'public/uploads', required: false },
    { relativePath: '.env', required: false },
  ];

  const included = [];

  try {
    for (const item of backupItems) {
      const source = path.join(backendDir, item.relativePath);
      const destination = path.join(stagingDir, item.relativePath);
      const itemExists = await exists(source);

      if (!itemExists) {
        if (item.required) {
          throw new Error(`Не найден обязательный путь: ${item.relativePath}`);
        }
        continue;
      }

      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.cp(source, destination, { recursive: true, force: true });
      included.push(item.relativePath);
    }

    const manifest = {
      version: 1,
      createdAt: new Date().toISOString(),
      backendDir,
      included,
    };

    await fs.writeFile(
      path.join(stagingDir, 'backup-manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf8',
    );

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await compressWithPowerShell(stagingDir, outPath);

    console.log('Резервная копия создана.');
    console.log(`Архив: ${outPath}`);
    console.log(`Включено: ${included.length ? included.join(', ') : 'ничего (проверь пути)'}`);
  } finally {
    await fs.rm(stagingDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error('Ошибка backup:', error.message);
  process.exit(1);
});
