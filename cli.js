#!/usr/bin/env node

var extensionChecker = require('./libs/ext-checker');
var cliReporter = require('./libs/reporters/cli-reporter');
var jsonReporter = require('./libs/reporters/json-reporter');

var argv = require('minimist')(process.argv.slice(2));

if (!argv.path) {
    return console.error("Provide a path to the extension folder or a crx.");
}

var reporter = cliReporter;

if (argv.reporter) {
    if (argv.reporter.match(/^(cli|json)$/) === null) {
        return console.error("Reporter can only be 'cli' or 'json'.");
    }

    if (argv.reporter === "json") {
        reporter = jsonReporter;
    }
}

extensionChecker(argv.path, function (error, report) {
    if (error) {
        return console.error(error);
    }

    reporter(report);
});
