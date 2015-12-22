# crx2ff

[![NPM Version](https://img.shields.io/npm/v/crx2ff.svg)](https://www.npmjs.com/package/crx2ff)
[![NPM Downloads](https://img.shields.io/npm/dm/crx2ff.svg)](http://npm-stat.com/charts.html?package=crx2ff&author=&from=&to=)

Check the compatibility of a Chrome extension with the Firefox WebExtensions API.

## Installation

```sh
npm install -g crx2ff
```

## Usage

```sh
# Analyse an extension
crx2ff analyse <extension> [--exclude-glob=<GLOB>] [--reporter=<REPORTER>] [--report-file=<FILE>]

# Convert an extension
crx2ff convert <extension> [--exclude-glob=<GLOB>] [--output=<FILE>] [--id=<ID>]
```

### Arguments

The extension to process can be provided as:
* A path to a local extension folder
* A path to a local crx or zip of the extension
* An id of an extension stored on the Chrome WebStore

Common arguments
* `--exclude-glob=GLOB`: a `minimatch` glob to exclude paths during analysis/packaging. Defaults to `**/{.git,.hg,.svn,.DS_Store,*.pem}`.

Reporting arguments
* `--reporter=REPORTER` Analysis reporter selection (defaults to cli)
* `--report-file=FILE` Output file for json reporting (defaults to ./crx2ff.json)

Conversion arguments
* `--output=FILE` Conversion output file (defaults to ./crx2ff.xpi)
* `--id=ID` Created extension id (defaults to crx2ff@example.org)

## License

MIT
