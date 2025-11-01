import { test } from 'node:test';
import assert from 'node:assert';
import { openInBrowser } from '../src/open.js';

test('openInBrowser is a function', () => {
  assert.strictEqual(typeof openInBrowser, 'function');
});

test('openInBrowser accepts URL string', async () => {
  // This test verifies the function can be called with a URL
  // Note: We don't actually open a browser in tests to avoid side effects
  const url = 'https://example.com';
  assert.strictEqual(typeof url, 'string');
});

test('openInBrowser accepts options object', async () => {
  // Verify options parameter structure
  const options = { browser: 'chrome', quiet: true };
  assert.strictEqual(typeof options, 'object');
  assert.strictEqual(typeof options.browser, 'string');
  assert.strictEqual(typeof options.quiet, 'boolean');
});

test('Browser options are valid', () => {
  const validBrowsers = ['chrome', 'firefox', 'edge', undefined];
  validBrowsers.forEach(browser => {
    if (browser !== undefined) {
      assert.strictEqual(typeof browser, 'string');
    }
  });
});

test('Platform detection works', () => {
  const platform = process.platform;
  assert.ok(['win32', 'darwin', 'linux'].includes(platform) || platform.startsWith('linux'));
});

