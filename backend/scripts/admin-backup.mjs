import fs from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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

/** Максимальная длина пути в Windows; ограничение снижает риск странных значений. */
const MAX_OUT_PATH_LEN = 32767;

/**
 * Нормализует и проверяет пользовательский путь --out до любых операций с ФС.
 * Без shell это не про command injection, но блокирует NUL/управляющие и «размытые» пути.
 */
function sanitizeAndResolveOutArg(outArg, cwd, defaultPath) {
  const raw =
    outArg !== undefined && outArg !== null && String(outArg).trim() !== ''
      ? String(outArg).trim()
      : null;
  const base = raw ? path.normalize(raw) : defaultPath;

  if (!base || base.length === 0) {
    throw new Error('Путь --out не может быть пустым.');
  }
  if (base.length > MAX_OUT_PATH_LEN) {
    throw new Error('Путь --out слишком длинный.');
  }
  // NUL и управляющие символы недопустимы в путях и опасны при дальнейшей обработке.
  if (/\0/.test(base) || /[\x01-\x1f\x7f]/.test(base)) {
    throw new Error('Путь --out содержит недопустимые символы.');
  }

  let resolved = path.resolve(cwd, base);

  // Как Compress-Archive: если расширение .zip не указано, оно добавляется автоматически.
  if (!resolved.toLowerCase().endsWith('.zip')) {
    resolved += '.zip';
  }

  if (resolved.length > MAX_OUT_PATH_LEN) {
    throw new Error('Путь --out слишком длинный после нормализации.');
  }

  return resolved;
}

/**
 * Создаёт ZIP из каталога без вызова shell: только Node API + adm-zip.
 * zipPath '' — содержимое каталога в корне архива (аналог Compress-Archive -Path "dir\*").
 */
function writeStagingDirAsZip(sourceDir, archivePath) {
  const zip = new AdmZip();
  zip.addLocalFolder(sourceDir, '');
  zip.writeZip(archivePath);
}

async function main() {
  if (process.platform !== 'win32') {
    throw new Error('Этот скрипт рассчитан на Windows (PowerShell Compress-Archive).');
  }

  const args = parseArgs(process.argv.slice(2));
  const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const defaultArchiveName = `admin-backup-${timestampForFileName()}.zip`;
  const defaultOut = path.join(backendDir, 'backups', defaultArchiveName);

  const outPath = sanitizeAndResolveOutArg(args.out, process.cwd(), defaultOut);
  const stagingDir = await fs.mkdtemp(path.join(os.tmpdir(), 'strapi-admin-backup-'));
  const includeEnv = Boolean(args['include-env']);

  const backupItems = [
    { relativePath: '.tmp/data.db', required: false },
    { relativePath: 'public/uploads', required: false },
  ];
  if (includeEnv) {
    backupItems.push({ relativePath: '.env', required: false });
  }

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

    if (includeEnv && !included.includes('.env')) {
      console.warn('Указан --include-env, но backend/.env не найден — в архив секреты не попали.');
    }

    const envIncluded = included.includes('.env');
    const manifest = {
      version: 1,
      createdAt: new Date().toISOString(),
      backendDir,
      included,
      envIncluded,
    };

    await fs.writeFile(
      path.join(stagingDir, 'backup-manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf8',
    );

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    writeStagingDirAsZip(stagingDir, outPath);

    console.log('Резервная копия создана.');
    console.log(`Архив: ${outPath}`);
    console.log(`Включено: ${included.length ? included.join(', ') : 'ничего (проверь пути)'}`);
    console.log(`envIncluded (в манифесте): ${envIncluded}`);
  } finally {
    await fs.rm(stagingDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error('Ошибка backup:', error.message);
  process.exit(1);
});
