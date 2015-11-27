#!/usr/bin/env node

var extensionChecker = require('./libs/ext-checker');
var extensionConverter = require('./libs/ext-converter');
var cliReporter = require('./libs/reporters/cli-reporter');
var jsonReporter = require('./libs/reporters/json-reporter');
var dlCrx = require('./libs/utils/dl-crx');

var argv = require('minimist')(process.argv.slice(2));

if (!argv._.length) {
    return console.error("Provide a command to run.");
}

var commands = ['analyse', 'convert'];
var command = argv._[0];

if (commands.indexOf(command) === -1) {
    return console.error("Unknown command: " + command);
}

if (argv._.length === 1) {
    return console.error("Provide the path or id of the extension to be processed.");
}

if (command === 'analyse') {
    if (argv.reporter && argv.reporter.match(/^(cli|json)$/) === null) {
        return console.error("Reporter can only be 'cli' or 'json'.");
    }

    return extensionChecker(argv._[1], function (error, report) {
        if (error) {
            return console.error(error);
        }

        if (argv.reporter === 'json') {
            var jsonPath =  argv['report-file'] || null;
            return jsonReporter(report, jsonPath)
        }

        return cliReporter(report);
    });
} else {
    return extensionConverter(argv._[1], argv.output, console.log.bind(console));
}
