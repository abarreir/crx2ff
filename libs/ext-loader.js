var tmp = require('tmp');
var fs = require('fs-extra');
var path = require('path');

var dlCrx = require('./utils/dl-crx');
var crxUnzip = require('./utils/unzip-crx');
var Filter = require('./utils/filter');

var cwsIdRegex = /[a-z]{32}/;

function loadFromPath (extensionPath, readOnly, excludes, cb) {

    fs.lstat(extensionPath, function (error, stats) {
        if (error) {
            return cb(error);
        }

        if (!stats.isDirectory() && !extensionPath.match(/\.(crx|zip)$/)) {
            return cb(new Error("Path must point to a directory, crx or zip."));
        }

        if (stats.isDirectory() && readOnly) {
            // Just return the path when we're not planning to do modifications
            return cb(null, extensionPath);
        }

        tmp.dir({unsafeCleanup: true}, function (error, tmpPath) {
            if (error) {
                return cb(error);
            }

            var done = function (error) {
                if (error) {
                    return cb(error);
                }

                return cb(null, tmpPath);
            };

            // Copy extension directory into temporary one for modification
            var filter = Filter(excludes);
            if (stats.isDirectory()) {
                fs.copy(extensionPath, tmpPath, filter, done);
            } else {
                crxUnzip(extensionPath, tmpPath, done);
            }
        });
    });
}

function load (idOrPath, readOnly, excludes, cb) {
    if (typeof excludes === 'function') {
        cb = excludes;
        excludes = null;
    }
    if (idOrPath.match(cwsIdRegex)) {
        return dlCrx(idOrPath, function (error, crxPath) {
            if (error) {
                return cb(error);
            }

            return loadFromPath(crxPath, true, excludes, cb);
        });
    }

    return loadFromPath(idOrPath, readOnly, excludes, cb);
}

module.exports = load;
