var glob = require('glob');

var exprFinder = require('./expr-finder');
var matcher = require('./support-matcher');

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

module.exports = processExtensionFiles;
