#!/usr/bin/env node

var extensionChecker = require('./libs/ext-checker');
var cliReporter = require('./libs/reporters/cli-reporter');
var jsonReporter = require('./libs/reporters/json-reporter');
var dlCrx = require('./libs/utils/dl-crx');

var argv = require('minimist')(process.argv.slice(2));

if (!argv.path && !argv.id) {
    return console.error("Provide a path to the extension folder/crx, or a CWS extension id.");
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

function onChecked (error, report) {
    if (error) {
        return console.error(error);
    }

    reporter(report);
} 

if (argv.id) {
    return dlCrx(argv.id, function (error, crx) {
        if (error) {
            return console.log(error);
        }

        return extensionChecker(crx, onChecked)
    });
}

extensionChecker(argv.path, onChecked);
