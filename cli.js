#!/usr/bin/env node

var extensionChecker = require('./libs/ext-checker');
var cliReporter = require('./libs/reporters/cli-reporter');

var argv = require('minimist')(process.argv.slice(2));

if (!argv.path) {
    return console.error("Provide a path to the extension folder or a crx.");
}

extensionChecker(argv.path, function (error, report) {
    if (error) {
        return console.error(error);
    }

    cliReporter(report);
});
