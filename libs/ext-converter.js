var fs = require('fs-extra');
var tmp = require('tmp');
var path = require('path');
var jszip = require('jszip');

var loadExtension = require('./ext-loader');
var apiProxyPath = __dirname + '/../static/chrome-apis-proxy.js';

function updateManifest (extensionPath, extensionId, cb) {
    // Add missing fields to json manifest
    var manifestPath = extensionPath + "/manifest.json";

    fs.readFile(manifestPath, function (error, manifest) {
        if (error) {
            return cb(error);
        }

        var m = JSON.parse(manifest);

        m.applications = {
            gecko: {
                id: extensionId || "crx2ff@example.org"
            }
        };

        // Add path to our api proxy script
        if (!m.background) m.background = {};
        if (!m.background.scripts) m.background.scripts = [];

        // Must be first script in list since it overrides the chrome object
        m.background.scripts.unshift('chrome-apis-proxy.js');

        fs.writeFile(manifestPath, JSON.stringify(m), cb);
    });
}

function convertExtension (extensionPath, outputPath, extensionId, cb) {
    updateManifest(extensionPath, extensionId, function (error) {
        if (error) {
            return cb(error);
        }

        var zip = new jszip();
        var zipOpts = { compression: 'deflate' };

        // Zip converted extension
        fs.walk(extensionPath)
        .on('data', function (item) {
            if (item.stats.isFile()) {
                var relPath = path.relative(extensionPath, item.path);
                zip.file(relPath, fs.readFileSync(item.path), zipOpts);
            }
        })
        .on('end', function () {
            // Add our api proxy script to bundle
            zip.file('chrome-apis-proxy.js', fs.readFileSync(apiProxyPath), zipOpts);

            var z = zip.generate({type: 'nodebuffer'});

            fs.writeFile(outputPath || 'crx2ff.xpi', z, cb);
        });
    });
}

function converter (pathOrId, outputPath, extensionId, cb) {
    return loadExtension(pathOrId, false, function (error, extensionPath) {
        if (error) {
            return cb(error);
        }

        return convertExtension(extensionPath, outputPath, extensionId, cb);
    });
}

module.exports = converter;
