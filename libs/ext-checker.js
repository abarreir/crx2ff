var fs = require('fs');
var glob = require('glob');
var tmp = require('tmp');

var exprFinder = require('./expr-finder');
var matcher = require('./support-matcher');
var crxUnzip = require('./utils/unzip-crx');

var unknownApis = {};
var usedApis = {};

function processExtensionFiles (extensionPath, cb) {
    glob(extensionPath + "/**/*.js", function (error, scripts) {
        if (error) {
            return cb(error);
        }

        scripts.forEach(processScript);

        return cb(null, {
            used: usedApis,
            unknown: unknownApis
        });
    });
}

function processScript (scriptPath) {
    // Returns chrome.* expressions found in file at scriptPath
    var chromeExprs = exprFinder(scriptPath);

    if (!chromeExprs) {
        return;
    }

    Object.keys(chromeExprs).forEach(function (expr) {
        treatExpression(expr, chromeExprs[expr], scriptPath);
    });
}

function treatExpression (expr, locations, scriptPath) {
    var parsedExpr = matcher(expr);

    // List unrecognized API expressions, so users can easily report issues
    // with the matcher
    if (!parsedExpr.api) {
        if (!unknownApis[expr]) {
            unknownApis[expr] = [];
        }

        return unknownApis[expr].push({
            file: scriptPath,
            locations: locations
        });
    }

    // Don't deal with feature detection expressions (top level api without,
    // any property specified)
    if (!parsedExpr.property) {
        return;
    }

    // Build a dict of format
    //  - topLevelAPI
    //      - apiExpr
    //          - locations within files
    if (!usedApis[parsedExpr.api]) {
        usedApis[parsedExpr.api] = {};
    }

    if (!usedApis[parsedExpr.api][parsedExpr.property]) {
        usedApis[parsedExpr.api][parsedExpr.property] = {
            status: parsedExpr.status,
            filesLocations: []
        };
    }

    usedApis[parsedExpr.api][parsedExpr.property].filesLocations.push({
        file: scriptPath,
        locations: locations
    });
}

function checker (path, cb) {
    fs.lstat(path, function (error, stats) {
        if (error) {
            return cb(error);
        }

        if (!stats.isDirectory() && !path.match(/\.(crx|zip)$/)) {
            return cb(new Error("Path must point to a directory, crx or zip."));
        }

        if (stats.isDirectory()) {
            return processExtensionFiles(path, cb);
        }

        tmp.dir({unsafeCleanup: true}, function (error, tmpPath) {
            if (error) {
                return cb(error);
            }

            crxUnzip(path, tmpPath, function (error) {
                if (error) {
                    return cb(error);
                }

                return processExtensionFiles(tmpPath, cb);
            });
        });
    });
}

module.exports = checker;
