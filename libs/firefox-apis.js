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

function ExtensionSupport (propsChain) {
    var support = [
        "getURL",
        "inIncognitoContex",
        "getBackgroundPage",
        "getViews",
    ].join('|');

    var r = new RegExp("^(" + support + ")");

    if (r.exec(propsChain) !== null) {
        return new SupportStatus("SUPPORT");
    }

    var futureSupport = [
        "isAllowedIncognitoAccess",
        "isAllowedFileSchemeAccess",
        "setUpdateUrlData",
        "lastError",
    ].join('|');

    var r2 = new RegExp("^(" + futureSupport + ")");

    if (r2.exec(propsChain) !== null) {
        return new SupportStatus("FUTURE_SUPPORT");
    }

    return new SupportStatus("NO_SUPPORT");
}

function i18nSupport (propsChain) {
    var support = [
        "getMessage",
    ].join('|');

    var r = new RegExp("^(" + support + ")");
    if (r.exec(propsChain) !== null) {
        return new SupportStatus("SUPPORT");
    }

    var futureSupport = [
        "getAcceptLanguages",
        "getUILanguage",
        "detectLanguage",
    ].join('|');

    var r2 = new RegExp("^(" + futureSupport + ")");
    if (r2.exec(propsChain) !== null) {
        return new SupportStatus("FUTURE_SUPPORT");
    }

    return new SupportStatus("NO_SUPPORT");
}

function NotificationsSupport (propsChain) {
    if (propsChain.indexOf("create") === 0) {
        return new SupportStatus("WARN", "The only supported notification options are iconUrl, title, and message.");
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
        "getURL",
        "id",
        "sendMessage",
        "onMessage",
        "onConnect",
        "connect",
        "getPlatformInfo",
    ].join('|');

    var r = new RegExp("^(" + support + ")");
    if (r.exec(propsChain) !== null) {
        return new SupportStatus("SUPPORT");
    }

    var futureSupport = [
        "lastError",
        "getBackgroundPage",
        "openOptionsPage",
        "setUninstallURL",
        "reload",
        "requestUpdateCheck",
        "restart",
        "connectNative",
        "sendNativeMessage",
        "getPackageDirectoryEntry",
        "onInstalled",
        "onSuspend",
        "onSuspendCanceled",
        "onUpdateAvailable",
        "onBrowserUpdateAvailable",
        "onConnectExternal",
        "onMessageExternal",
        "onRestartRequired",
    ].join('|');

    var r2 = new RegExp("^(" + futureSupport + ")");
    if (r2.exec(propsChain) !== null) {
        return new SupportStatus("FUTURE_SUPPORT");
    }

    return new SupportStatus("NO_SUPPORT");
}

function StorageSupport (propsChain) {
    if (propsChain.match(/^(sync|managed)/) !== null) {
        return new SupportStatus("NO_SUPPORT");
    }

    if (propsChain.match(/(getBytesInUse)/) !== null) {
        return new SupportStatus("NO_SUPPORT");
    }

    return new SupportStatus("WARN", "Not supported in content scripts. See bug 1197346");
}

function TabsSupport (propsChain) {
    var noSupport = [
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
        return new SupportStatus("WARN", "Highlighted and active are treated as the same since Firefox cannot select multiple tabs.");
    }

    if (propsChain.indexOf("executeScript") === 0) {
        return new SupportStatus("WARN", "The callback argument is not supported yet.");
    }
    if (propsChain.indexOf("sendMessage") === 0) {
        return new SupportStatus("WARN", "The implementation appears to be broken. See bug 1209869.");
    }

    return new SupportStatus("SUPPORT");
}

function WebNavigationSupport (propsChain) {
    var noSupport = [
        "getFrame",
        "getAllFrames",
        "onCreatedNavigationTarget",
        "onHistoryStateUpdated",
        "onTabReplaced",
    ].join('|');

    var r = new RegExp("^(" + noSupport + ")");

    if (r.exec(propsChain) !== null) {
        return new SupportStatus("NO_SUPPORT");
    }

    if (propsChain.indexOf("onReferenceFragmentUpdated") === 0) {
        return [
            new SupportStatus("WARN", "This method also triggers for pushState."),
            new SupportStatus("WARN", "Filtering, transition types and qualifiers are unsupported.")
        ];
    }

    return new SupportStatus("WARN", "Filtering, transition types and qualifiers are unsupported.");
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

function BookmarksSupport (propsChain) {
    var noSupport = [
        "getRecent",
        "search",
        "removeTree",
        "onCreated",
        "onRemoved",
        "onChanged",
        "onMoved",
        "onChildrenReordered",
        "onImportBegan",
        "onImportEnded",
        "BookmarkTreeNodeUnmodifiable"
    ].join('|');

    var r = new RegExp("^(" + noSupport + ")");

    if (r.exec(propsChain) !== null) {
        return new SupportStatus("NO_SUPPORT");
    }

    if (propsChain.indexOf("removes") === 0) {
        return new SupportStatus("WARN", "This method also removes non empty folders.");
    }

    return new SupportStatus("SUPPORT");
}

function CookiesSupport (propsChain) {
    if (propsChain.indexOf("onChanged") === 0) {
        return new SupportStatus("WARN", "Events might be subtely different.");
    }

    if (propsChain.indexOf("set") === 0) {
        return new SupportStatus("WARN", "Creating session cookies with set might fail.");
    }

    if (propsChain.indexOf("getAllCookieStores") === 0) {
        return new SupportStatus("WARN", "This method always just returns one default store and no tabs.");
    }

    return new SupportStatus("WARN", "Accessing cookies from private tabs is impossible.");
}

module.exports = {
    // Fully supported APIs
    "alarms": FullSupport(),
    "contextMenus": FullSupport(),
    "browserAction": FullSupport(),
    "pageAction": FullSupport(),

    // Partially supported APIs
    "bookmarks": BookmarksSupport,
    "cookies": CookiesSupport,
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
    "commands": FutureSupport(),
    "debugger": FutureSupport(),
    "downloads": FutureSupport(),
    "history": FutureSupport(),
    "idle": FutureSupport(),
    "omnibox": FutureSupport(),
    "permissions": FutureSupport(),
    "devtools.panels": FutureSupport()
};
