var request = require('request');
var tmp = require('tmp');
var fs = require('fs');

// Credits to Rob--W for the following
// https://github.com/Rob--W/crxviewer/blob/master/src/cws_pattern.js
// Returns location of CRX file for a given extensionId
function get_crx_url (extensionId) {
    var platformInfo = {
        os: 'win',
        arch: 'x86-64',
        "nacl_arch": 'x86-64'
    };

    // Omitting this value is allowed, but add it just in case.
    // Source: http://cs.chromium.org/file:omaha_query_params.cc%20GetProdIdString
    var product_id = 'chromiumcrx';
    // Channel is "unknown" on Chromium on ArchLinux, so using "unknown" will probably be fine for everyone.
    var product_channel = 'unknown';
    // As of July, the Chrome Web Store sends 204 responses to user agents when their
    // Chrome/Chromium version is older than version 31.0.1609.0
    var product_version = '9999.0.9999.0';

    url = 'https://clients2.google.com/service/update2/crx?response=redirect';
    url += '&os=' + platformInfo.os;
    url += '&arch=' + platformInfo.arch;
    url += '&nacl_arch=' + platformInfo.nacl_arch;
    url += '&prod=' + product_id;
    url += '&prodchannel=' + product_channel;
    url += '&prodversion=' + product_version;
    url += '&x=id%3D' + extensionId;
    url += '%26uc';
    return url;
}

function dlCrx (extensionId, onDownloaded) {
    var url = get_crx_url(extensionId);
    var headers = {
        encoding: null
    };

    request(url, headers, function (error, res, body) {
        if (error) {
            return onDownloaded(error);
        }

        tmp.dir({unsafeCleanup: true}, function (error, tmpPath) {
            if (error) {
                return onDownloaded(error);
            }

            var crxPath = tmpPath + "/" + extensionId + ".crx";

            fs.writeFile(crxPath, body, function (error) {
                if (error) {
                    return onDownloaded(error);
                }

                return onDownloaded(null, crxPath);
            });
        });
    });
}

module.exports = dlCrx;
