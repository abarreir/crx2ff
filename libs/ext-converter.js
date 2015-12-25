var fs = require('fs-extra');
var tmp = require('tmp');
var path = require('path');
var jszip = require('jszip');
var esprima = require('esprima');

var loadExtension = require('./ext-loader');
var apiProxyPath = __dirname + '/../static/chrome-apis-proxy.js';

function updateManifest (extensionPath, extensionId, useProxy, cb) {
    // Add missing fields to json manifest
    var manifestPath = extensionPath + "/manifest.json";

    fs.readFile(manifestPath, function (error, manifest) {
        if (error) {
            return cb(error);
        }

        var m;
        try {
            m = JSON.parse(manifest);
        }
        catch (originalError) {
            // JSON parsing failed
            // trying to remove comments with esprima

            var jsString = 'var o =' + manifest;
            try {
                var tokens = esprima.tokenize(jsString).slice(3);
                var json = tokens.reduce((json, t) => json + t.value, '');
                m = JSON.parse(json);
            }
            catch (e) {
                originalError.message = 'Failed to parse manifest.json:\n' + originalError.message;
                return cb(originalError);
            }
        }

        m.applications = {
            gecko: {
                id: extensionId || "crx2ff@example.org"
            }
        };

        if (useProxy) {
            // Add path to our api proxy script
            if (!m.background) m.background = {};
            if (!m.background.scripts) m.background.scripts = [];

            // Must be first script in list since it overrides the chrome object
            m.background.scripts.unshift('chrome-apis-proxy.js');

            // add api proxy to content scripts
            if (m.content_scripts) {
                var proxy = {
                    matches: ['<all_urls>'],
                    match_about_blank: true,
                    all_frames: true,
                    js: ['chrome-apis-proxy.js'],
                    run_at: 'document_start'
                };
                m.content_scripts.unshift(proxy);
            }
        }

        fs.writeFile(manifestPath, JSON.stringify(m, null, '\t'), cb);
    });
}

function convertExtension (extensionPath, outputPath, extensionId, proxy, cb) {
    updateManifest(extensionPath, extensionId, proxy, function (error) {
        if (error) {
            return cb(error);
        }

        var zip = new jszip();
        var zipOpts = { compression: 'deflate' };

        // Zip converted extension
        fs.walk(extensionPath)
        .on('data', function (item) {
            var relPath = path.relative(extensionPath, item.path);
            if (item.stats.isFile()) {
                zip.file(relPath, fs.readFileSync(item.path), zipOpts);
            }
            else if (item.stats.isDirectory()) {
                zip.folder(relPath);
            }
        })
        .on('end', function () {

            if (proxy) {
                // Add our api proxy script to bundle
                zip.file('chrome-apis-proxy.js', fs.readFileSync(apiProxyPath), zipOpts);
            }

            var z = zip.generate({type: 'nodebuffer'});

            fs.writeFile(outputPath || 'crx2ff.xpi', z, cb);
        });
    });
}

function converter (pathOrId, outputPath, extensionId, opts, cb) {
    if (typeof opts === 'function') {
        cb = opts;
        opts = { proxy: true };
    }
    else if (typeof opts === 'string') {
        opts = { excludeGlob: opts, proxy: true };
    }

    return loadExtension(pathOrId, false, opts.excludeGlob, function (error, extensionPath) {
        if (error) {
            return cb(error);
        }

        return convertExtension(extensionPath, outputPath, extensionId, opts.proxy, cb);
    });
}

module.exports = converter;
