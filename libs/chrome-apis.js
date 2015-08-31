// This file contains the list of current chrome APIs as of August the 28th, 2015
//
// An alternative way to keep the list up to date would be to parse
// https://chromium.googlesource.com/chromium/src.git/+/master/chrome/common/extensions/api/_api_features.json
// and apply the instructions in that source file 
// https://chromium.googlesource.com/chromium/src.git/+/master/chrome/common/extensions/docs/server2/api_list_data_source.py
// to determine which api is "listable or not"

var stable = [
    "accessibilityFeatures",
    "alarms",
    "bookmarks",
    "browserAction",
    "browsingData",
    "commands",
    "contentSettings",
    "contextMenus",
    "cookies",
    "debugger",
    "declarativeContent",
    "desktopCapture",
    "devtools.inspectedWindow",
    "devtools.network",
    "devtools.panels",
    "documentScan",
    "downloads",
    "enterprise.platformKeys",
    "events",
    "extension",
    "extensionTypes",
    "fileBrowserHandler",
    "fileSystemProvider",
    "fontSettings",
    "gcm",
    "history",
    "i18n",
    "identity",
    "idle",
    "input.ime",
    "management",
    "networking.config",
    "notifications",
    "omnibox",
    "pageAction",
    "pageCapture",
    "permissions",
    "power",
    "printerProvider",
    "privacy",
    "proxy",
    "runtime",
    "sessions",
    "storage",
    "system.cpu",
    "system.memory",
    "system.storage",
    "tabCapture",
    "tabs",
    "topSites",
    "tts",
    "ttsEngine",
    "types",
    "vpnProvider",
    "wallpaper",
    "webNavigation",
    "webRequest",
    "webstore",
    "windows",
];

var beta = [
    "declarativeWebRequest",
    "platformKeys"
];

var dev = [
    "automation",
    "instanceID",
    "location",
    "processes",
    "signedInDevices"
];

var experimental = [
    "experimental.devtools.audits",
    "experimental.devtools.console"
];

function parseApiExpression (expr) {
    var props = expr.split('.'),
        api;

    if (props[0] !== 'chrome')
        throw "Only match apis prefixed with 'chrome'";

    // Remove the chrome prefix
    props.shift();

    // Don't only look for the first property since some APIs are composed of
    // several (see devtools.* or input.ime)

    // Only check stable APIs for now
    for (api = props.shift(); props.length && stable.indexOf(api) === -1;) {
        api += "." + props.shift();
    }

    if (stable.indexOf(api) === -1) {
        return null;
    }

    return {
        api: api,
        property: props.length && props.join('.') || ""
    };
}

module.exports = {
    stable: stable,
    beta: beta,
    dev: dev,
    experimental: experimental,
    parseApiExpression: parseApiExpression
};