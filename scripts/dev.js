import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apps = [{
  name: 'API',
  folder: 'server',
  script: './node_modules/nodemon/bin/nodemon.js',
  args: ['server.js']
}, {
  name: 'Web',
  folder: 'client',
  script: './node_modules/vite/bin/vite.js',
  args: ['--host', '0.0.0.0']
}];
const children = apps.map(({
  name,
  folder,
  script,
  args
}) => {
  const child = spawn(process.execPath, [script, ...args], {
    cwd: resolve(projectRoot, folder),
    stdio: 'inherit'
  });
  child.on('error', error => {
    console.error(`${name} failed to start: ${error.message}`);
    stopAll(1);
  });
  child.on('exit', code => {
    if (code && code !== 0) stopAll(code);
  });
  return child;
});
let stopping = false;
function stopAll(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exitCode = exitCode;
}
process.on('SIGINT', () => stopAll());
process.on('SIGTERM', () => stopAll());
