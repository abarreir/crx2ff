var fs = require('fs-extra');

var jszip = require('jszip');
var path = require('path');
var async = require('async');

function doUnzip (buffer, targetPath, cb) {
    var zip = new jszip(buffer);

    async.eachSeries(Object.keys(zip.files), function (filename, onDone) {
        var isFile = !zip.files[filename].dir,
            fullpath  = path.join(targetPath, filename),
            directory = isFile && path.dirname(fullpath) || fullpath,
            content = zip.files[filename].asNodeBuffer();
            
        fs.mkdirs(directory, function (error) {
            if (error) {
                return onDone(error)
            }
            
            if (isFile) {
                return fs.writeFile(fullpath, content, onDone);
            }

            return onDone(null);
        });
    }, function (error) {
        return cb(error);
    });
}


// Credits to Rob--W for the following 
// https://github.com/Rob--W/crxviewer/blob/master/src/lib/crx-to-zip.js
function crxToZip (crxPath, targetPath, cb) {
    fs.readFile(crxPath, function (error, buf) {
        if (error) {
            return cb(error);
        }

        // 50 4b 03 04
        // This is actually a zip file
        if (buf[0] === 80 && buf[1] === 75 && buf[2] === 3 && buf[3] === 4) {
            return doUnzip(buf, targetPath, cb);
        }

        // 43 72 32 34
        if (buf[0] !== 67 || buf[1] !== 114 || buf[2] !== 50 || buf[3] !== 52)
            return cb('Invalid header: Does not start with Cr24');

        // 02 00 00 00
        if (buf[4] !== 2 || buf[5] || buf[6] || buf[7])
            return cb('Unexpected crx format version number.');

        var publicKeyLength = calcLength(buf[ 8], buf[ 9], buf[10], buf[11]);
        var signatureLength = calcLength(buf[12], buf[13], buf[14], buf[15]);

        // 16 = Magic number (4), CRX format version (4), lengths (2x4)
        var zipStartOffset = 16 + publicKeyLength + signatureLength;
        var crx = buf.slice(zipStartOffset, buf.length);

        return doUnzip(crx, targetPath, cb);
    });
}

function calcLength (a, b, c, d) {
    var length = 0;
    length += a;
    length += b <<  8;
    length += c << 16;
    length += d << 24;
    return length;
}

function getAsBase64 (bytesView, startOffset, endOffset) {
    var binaryString = '';
    for (var i = startOffset; i < endOffset; ++i) {
        binaryString += String.fromCharCode(bytesView[i]);
    }
    return btoa(binaryString);
}

module.exports = crxToZip;
