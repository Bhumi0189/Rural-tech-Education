import { spawn } from 'child_process';
import net from 'net';

const findFreePort = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', reject);

    server.once('listening', () => {
      const address = server.address();
      server.close(() => {
        if (typeof address === 'object' && address) {
          resolve(address.port);
          return;
        }

        reject(new Error('Unable to determine a free port.'));
      });
    });

    server.listen(0);
  });

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

const apiPort = await findFreePort();
process.env.API_PORT = String(apiPort);

const services = [
  {
    name: 'api',
    args: ['run', 'dev:api'],
  },
  {
    name: 'web',
    args: ['run', 'dev'],
  },
];

const children = services.map(({ name, args }) => {
  const child = spawn(npmCommand, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env: {
      ...process.env,
      API_PORT: String(apiPort),
    },
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${name}] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${name}] ${chunk}`);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[${name}] exited with signal ${signal}`);
    } else {
      console.log(`[${name}] exited with code ${code}`);
    }

    if (typeof code === 'number' && code !== 0) {
      for (const other of children) {
        if (other !== child && !other.killed) {
          other.kill();
        }
      }
      process.exit(code);
    }
  });

  return child;
});

const shutdown = (signal) => {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }

  setTimeout(() => process.exit(0), 250);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

console.log(`Starting API on port ${apiPort} and web server on port 3000...`);