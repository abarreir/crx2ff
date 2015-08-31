// Processing is done based on the list found at 
// https://wiki.mozilla.org/WebExtensions#List_of_supported_APIs

// Since support of an API is not binary, there is more logic here
// than on chrome APIs detection

function SupportStatus (type, msg) {
    this.type = type;
    this.msg = msg;
}

function FutureSupport () {
    return function (propsChain) {
        return new SupportStatus("FUTURE_SUPPORT");
    };
}

function FullSupport () {
    return function (propsChain) {
        return new SupportStatus("FULL_SUPPORT");
    };
}

function BrowserActionSupport (propsChain) {
    if (propsChain.indexOf("setIcon") === 0) {
        return new SupportStatus("WARN", "The imageData attribute on setIcon is not supported.");
    }

    if (propsChain.match(/^(enable|disable)/) !== null) {
        return new SupportStatus("NO_SUPPORT");
    }

    return new SupportStatus("SUPPORT");
}

function ExtensionSupport (propsChain) {
    if (propsChain.match(/^(getBackgroundPage|getURL)/) === null) {
        return new SupportStatus("NO_SUPPORT");
    }

    return new SupportStatus("SUPPORT");
}

function i18nSupport (propsChain) {
    if (propsChain.indexOf("getMessage") === -1) {
        return new SupportStatus("NO_SUPPORT");
    }

    return new SupportStatus("SUPPORT");
}

function NotificationsSupport (propsChain) {
    if (propsChain.indexOf("create") === 0) {
        return new SupportStatus("WARN", "The only supported notification options are iconUrl, title, and message.")
    }

    if (propsChain.indexOf("onClosed") === 0) {
        return new SupportStatus("WARN", "The byUser data is not provided.");
    }

    if (propsChain.match(/^(getAll|clear)/) === null) {
        return new SupportStatus("NO_SUPPORT");
    }

    return new SupportStatus("SUPPORT");
}

function RuntimeSupport (propsChain) {
    var support = [
        "onStartup", 
        "getManifest", 
        "id", 
        "sendMessage", 
        "onMessage", 
        "onConnect", 
        "connectNative"
    ].join('|');

    var r = new RegExp("^(" + support + ")");
    var m = r.exec(propsChain);
    
    if (m === null) {
        return new SupportStatus("NO_SUPPORT");
    }

    if (m[0] === "connectNative") {
        return new SupportStatus("FUTURE_SUPPORT");
    }

    return new SupportStatus("SUPPORT");
}

function StorageSupport (propsChain) {
    if (propsChain.match(/^sync/) !== null) {
        return new SupportStatus("NO_SUPPORT");
    }

    if (propsChain.match(/(getBytesInUse|clear)/) !== null) {
        return new SupportStatus("NO_SUPPORT");
    }

    return new SupportStatus("SUPPORT");
}

function TabsSupport (propsChain) {
    var noSupport = [
        "getCurrent", 
        "sendRequest", 
        "getSelected", 
        "duplicate", 
        "highlight", 
        "move", 
        "detectLanguage", 
        "captureVisibleTab", 
        "getZoom",
        "setZoom", 
        "getZoomSettings",
        "setZoomSettings"
    ].join('|');

    var r = new RegExp("^(" + noSupport + ")");

    if (r.exec(propsChain) !== null) {
        return new SupportStatus("NO_SUPPORT");
    }

    var highlightActive = [
        "highlight",
        "update",
        "onActiveChanged",
        "onActivated",
        "onHighlightChanged",
        "onHighlighted"
    ].join('|');

    var r2 = new RegExp("^(" + highlightActive + ")");

    if (r2.exec(propsChain) !== null) {
        return new SupportStatus("WARN", "Highlighted and active are treated as the same since Firefox cannot select multiple tabs.")
    }

    return new SupportStatus("SUPPORT");
}

function WebNavigationSupport (propsChain) {
    var noSupport = [
        "getFrame",
        "getAllFrames",
        "onCreatedNavigationTarget",
        "onHistoryStateUpdated"
    ].join('|');

    var r = new RegExp("^(" + noSupport + ")");

    if (r.exec(propsChain) !== null) {
        return new SupportStatus("NO_SUPPORT");
    }

    if (propsChain.indexOf("onReferenceFragmentUpdated") === 0) {
        return [
            new SupportStatus("WARN", "This method also triggers for pushState."),
            new SupportStatus("WARN", "Filtering is unsupported.")
        ];
    }

    return new SupportStatus("WARN", "Filtering is unsupported.");
}

function WebRequestSupport (propsChain) {
    var noSupport = [
        "handlerBehaviorChanged",
        "onAuthRequired", 
        "onBeforeRedirect",
        "onErrorOccurred"
    ].join('|');

    var r = new RegExp("^(" + noSupport + ")");

    if (r.exec(propsChain) !== null) {
        return new SupportStatus("NO_SUPPORT");
    }

    if (propsChain.indexOf("onBeforeRequest") === 0) {
        return new SupportStatus("WARN", "Requests can not be modified/redirected on this method.");
    }

    if (propsChain.indexOf("onBeforeSendHeaders") === 0) {
        return new SupportStatus("WARN", "Requests can not be canceled on this method.");
    }

    if (propsChain.indexOf("") === 0) {
        return new SupportStatus("WARN", "Requests can not be redirected or canceled on this method.");
    }

    return new SupportStatus("WARN", "Requests can not be canceled, modified or redirected on this method.");
}

function WindowsSupport (propsChain) {
    if (propsChain.indexOf("onFocusChanged") === 0) {
        return new SupportStatus("WARN", "This method will trigger multiple times for a given focus change.");
    }

    if (propsChain.indexOf("create") === 0) {
        return new SupportStatus("WARN", "This method does not support the focused, type, or state options.");
    }

    if (propsChain.indexOf("update") === 0) {
        return new SupportStatus("WARN", "This method only supports the focused option.");
    }

    return new SupportStatus("SUPPORT");
}

module.exports = {
    // Fully supported APIs
    "alarms": FullSupport(),

    // Partially supported APIs
    "browserAction": BrowserActionSupport,
    "extension": ExtensionSupport,
    "i18n": i18nSupport,
    "notifications": NotificationsSupport,
    "runtime": RuntimeSupport,
    "storage": StorageSupport,
    "tabs": TabsSupport,
    "webNavigation": WebNavigationSupport,
    "webRequest": WebRequestSupport,
    "windows": WindowsSupport,

    // Future APIs
    "bookmarks": FutureSupport(),
    "commands": FutureSupport(),
    "contextMenus": FutureSupport(),
    "cookies": FutureSupport(),
    "downloads": FutureSupport(),
    "history": FutureSupport(),
    "idle": FutureSupport(),
    "omnibox": FutureSupport(),
    "pageAction": FutureSupport(),
    "permissions": FutureSupport(),
};
