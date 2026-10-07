import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const seed = spawn(process.execPath, ['seed/seed.js'], {
  cwd: resolve(projectRoot, 'server'),
  stdio: 'inherit'
});
seed.on('error', error => {
  console.error(`Seed failed to start: ${error.message}`);
  process.exitCode = 1;
});
seed.on('exit', code => {
  process.exitCode = code ?? 1;
});
