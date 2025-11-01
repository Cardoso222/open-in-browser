# open-in-browser-cli

> Open URLs or local files in your default browser — cross-platform.

[![npm version](https://img.shields.io/npm/v/open-in-browser-cli.svg)](https://www.npmjs.com/package/open-in-browser-cli)

## Install

```sh
npm install --global open-in-browser-cli
```

## Usage

```sh
$ open-in-browser --help

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
```

## Features

- Cross-platform support (macOS, Windows, Linux, WSL)
- Optional browser selection (`--chrome`, `--firefox`, `--edge`)
- Silent mode (`--quiet` to suppress logs)
- Open multiple URLs (`open-in-browser https://a.com https://b.com`)
- Integration-friendly (exit code 0/1 based on success)

## Examples

Open a URL in the default browser:
```sh
open-in-browser https://github.com
```

Open a local file:
```sh
open-in-browser ./docs/index.html
```

Open in a specific browser:
```sh
open-in-browser https://localhost:3000 --chrome
```

Open multiple URLs:
```sh
open-in-browser https://github.com https://npmjs.com
```

## License

MIT © Paulo Cardoso

