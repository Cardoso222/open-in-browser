import { test } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test that CLI can be invoked
test('CLI accepts help flag', async () => {
  return new Promise((resolve, reject) => {
    const cliPath = path.join(__dirname, '..', 'src', 'cli.js');
    const child = spawn('node', [cliPath, '--help'], {
      cwd: path.join(__dirname, '..')
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      // Help should exit with code 0
      assert.strictEqual(code, 0);
      assert.ok(output.includes('Usage') || output.includes('open-in-browser'));
      resolve();
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
});

test('CLI validates input requirement', async () => {
  return new Promise((resolve, reject) => {
    const cliPath = path.join(__dirname, '..', 'src', 'cli.js');
    const child = spawn('node', [cliPath], {
      cwd: path.join(__dirname, '..')
    });

    let output = '';
    child.stderr.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      // Should exit with error code when no input provided
      assert.strictEqual(code, 1);
      assert.ok(output.includes('Error') || output.includes('required'));
      resolve();
    });

    child.on('error', (error) => {
      // If spawn fails, that's also a test failure
      reject(error);
    });
  });
});

test('CLI validates browser flags', async () => {
  return new Promise((resolve, reject) => {
    const cliPath = path.join(__dirname, '..', 'src', 'cli.js');
    const child = spawn('node', [cliPath, '--chrome', '--firefox', 'https://example.com'], {
      cwd: path.join(__dirname, '..')
    });

    let output = '';
    child.stderr.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      // Should exit with error code when multiple browser flags are provided
      assert.strictEqual(code, 1);
      assert.ok(output.includes('Error') || output.includes('one browser'));
      resolve();
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
});

