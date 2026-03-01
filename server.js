// This file serves as the entry point for Hostinger's Node.js environment.
// Hostinger requires a .js file for the "Entry file" setting.

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Hostinger server wrapper...');

// Run the actual TypeScript server using Node's native loader
const child = spawn('node', ['--import', 'tsx', 'server.ts'], {
    stdio: 'inherit',
    cwd: __dirname,
    env: process.env
});

child.on('error', (err) => {
    console.error('Failed to start server process:', err);
});

child.on('exit', (code, signal) => {
    console.log(`Server process exited with code ${code} and signal ${signal}`);
    process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down...');
    child.kill('SIGTERM');
});
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down...');
    child.kill('SIGINT');
});
