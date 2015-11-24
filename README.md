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
# With a local extension folder
crx2ff --path ~/path/to/an/extension

# With an extension stored on the CWS
crx2ff --id fdjamakpfbbddfjaooikfcpapjohcfmg

# Export compatibility report to json
crx2ff --id fdjamakpfbbddfjaooikfcpapjohcfmg --reporter json
```

### Arguments

* `--path [path]` path to an extension folder/crx/zip
* `--reporter [cli|json]` reporting method selection (defaults to cli)
* `--id [cwsExtensionId]` retrieve and analyse an extension stored in the Chrome WebStore

## License

MIT