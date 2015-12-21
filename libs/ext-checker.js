var fs = require('fs');
var path = require('path');
var glob = require('glob');
var async = require('async');

var loadExtension = require('./ext-loader');
var findExpressions = require('./expr-finder');
var matcher = require('./support-matcher');
var checkManifest = require('./manifest-checker');

var unknownApis = {};
var usedApis = {};

function processScripts (extensionPath, cb) {
    glob(extensionPath + "/**/*.js", function (error, scripts) {
        if (error) {
            return cb(error);
        }

        scripts.forEach(processScript.bind(this, extensionPath));

        return cb(null, {
            used: usedApis,
            unknown: unknownApis
        });
    });
}

function processManifest (extensionPath, cb) {
    fs.readFile(extensionPath + "/manifest.json", function (error, manifest) {
        if (error) {
            return cb(error);
        }

        return cb(null, checkManifest(JSON.parse(manifest)));
    });
}

function processExtensionFiles (extensionPath, cb) {
    async.series([
        processScripts.bind(this, extensionPath),
        processManifest.bind(this, extensionPath)
    ], function (error, results) {
        if (error) {
            return cb(error);
        }

        return cb(null, {
            scriptsReport: results[0],
            manifestReport: results[1]
        });
    });
}

function processScript (extensionPath, scriptPath) {
    // Returns chrome.* expressions found in file at scriptPath
    var chromeExprs = findExpressions(scriptPath);

    if (!chromeExprs) {
        return;
    }

    Object.keys(chromeExprs).forEach(function (expr) {
        var relPath = path.relative(extensionPath, scriptPath);
        treatExpression(expr, chromeExprs[expr], relPath);
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

function checker (pathOrId, excludes, cb) {
    if (typeof excludes === 'function') {
        cb = excludes;
        excludes = null;
    }

    return loadExtension(pathOrId, true, excludes, function (error, extensionPath) {
        if (error) {
            return cb(error);
        }

        return processExtensionFiles(extensionPath, cb);
    });
}

module.exports = checker;
