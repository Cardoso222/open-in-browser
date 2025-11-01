#!/usr/bin/env node

import meow from 'meow';
import { openInBrowser } from './open.js';

const cli = meow(`
  Usage
    $ open-in-browser <url|path> [options]

  Options
    --chrome     Open in Google Chrome
    --firefox    Open in Mozilla Firefox
    --edge       Open in Microsoft Edge
    --quiet      Suppress output

  Examples
    $ open-in-browser https://github.com
    $ open-in-browser ./index.html
    $ open-in-browser https://localhost:3000 --chrome
`, {
  importMeta: import.meta,
  flags: {
    chrome: {
      type: 'boolean',
      default: false
    },
    firefox: {
      type: 'boolean',
      default: false
    },
    edge: {
      type: 'boolean',
      default: false
    },
    quiet: {
      type: 'boolean',
      default: false,
      shortFlag: 'q'
    }
  }
});

async function main() {
  const { input, flags } = cli;

  // Explicitly handle --help/-h to ensure exit code 0 across shells
  if (flags.help || process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(cli.help);
    process.exit(0);
  }

  if (input.length === 0) {
    if (!flags.quiet) {
      console.error('Error: At least one URL or path is required.');
      console.error('Run `open-in-browser --help` for usage information.');
    }
    process.exit(1);
  }

  let browser;
  const browserFlags = [flags.chrome, flags.firefox, flags.edge].filter(Boolean);
  if (browserFlags.length > 1) {
    if (!flags.quiet) {
      console.error('Error: Only one browser flag can be specified.');
    }
    process.exit(1);
  }

  if (flags.chrome) {
    browser = 'chrome';
  } else if (flags.firefox) {
    browser = 'firefox';
  } else if (flags.edge) {
    browser = 'edge';
  }

  const results = await Promise.allSettled(
    input.map(url => openInBrowser(url, { browser, quiet: flags.quiet }))
  );

  const failures = results.filter(r => r.status === 'rejected');
  
  if (failures.length > 0) {
    if (!flags.quiet) {
      failures.forEach((failure, index) => {
        console.error(`Error: ${failure.reason.message || failure.reason}`);
      });
    }
    process.exit(1);
  }
}

main().catch((error) => {
  if (!cli.flags.quiet) {
    console.error('Error:', error.message);
  }
  process.exit(1);
});

