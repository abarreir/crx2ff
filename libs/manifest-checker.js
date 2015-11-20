var ffApis = require('./firefox-apis');
var chApis = require('./chrome-apis');

function SupportStatus (type, msg) {
    this.type = type;
    this.msg = msg;
}

function FutureSupport () {
    return function (propValue) {
        return new SupportStatus("FUTURE_SUPPORT");
    };
}

function FullSupport () {
    return function (propValue) {
        return new SupportStatus("FULL_SUPPORT");
    };
}

function BackgroundKeySupport (value) {
    if (value.hasOwnProperty("persistent")) {
        return new SupportStatus("WARN", "The persistent property is not supported");
    }

    return new SupportStatus("SUPPORT");
}

function ContentScriptsKeySupport (value) {
    var notSupported = {
        "include_globs": false,
        "exclude_globs": false,
        "match_about_blank": false
    };

    var notSupportedKeys = Object.keys(notSupported);

    value.forEach(function (csRule) {
        notSupportedKeys.forEach(function (k) {
            if (csRule.hasOwnProperty(k))
                notSupported[k] = true;
        });
    });

    var hasUnsupported = notSupportedKeys.reduce(function (has, key) {
        return has || notSupported[key];
    }, false);

    if (!hasUnsupported)
        return new SupportStatus("SUPPORT");

    var warnings = [];

    notSupportedKeys.forEach(function (key) {
        if (notSupported[key])
            warnings.push(new SupportStatus("WARN", key + " property is not supported"));
    });

    return warnings;
}

function PermissionsKeySupport (value) {
    var noSupport = [
        "activeTab",
        "background",
        "clipboardRead",
        "clipboardWrite",
        "geolocation",
        "nativeMessaging",
        "unlimitedStorage"
    ];

    var warnings = [];
    var warnNoSupport = function (permission) {
        warnings.push(new SupportStatus("WARN", permission + " permission is not supported"));
    };

    value.forEach(function (permission) {
        if (noSupport.indexOf(permission) !== -1) {
            warnNoSupport(permission);
        } else {
            // Check if this permission is an api
            var apiInfo = chApis.parseApiExpression('chrome.' + permission);

            if (apiInfo) {
                // Check if api is compatible 
                var ffApi = ffApis[apiInfo.api];

                if (!ffApi) {
                    warnNoSupport(permission);
                } else {
                    var apiSupport = ffApi("");

                    if (apiSupport.type === "NO_SUPPORT" || apiSupport.type === "FUTURE_SUPPORT") {
                        warnNoSupport(permission);
                    }
                }
            }
        }
    });

    if (!warnings.length)
        return new SupportStatus("SUPPORT");

    return warnings;
}

function WebAccessibleResourcesKeySupport (value) {
    for (var i = 0, l = value.length; i < l; ++i) {
        if (value[i].match("\\*")) 
            return new SupportStatus("WARN", "Wildcards not supported");
    }

    return new SupportStatus("SUPPORT");
}

var support = {
    // Fully supported keys
    "applications": FullSupport(),
    "browser_action": FullSupport(),
    "page_action": FullSupport(),
    "default_locale": FullSupport(),
    "description": FullSupport(),
    "icons": FullSupport(),
    "manifest_version": FullSupport(),
    "name": FullSupport(),
    "version": FullSupport(),
    "web_accessible_resources": FullSupport(),

    // Partially supported keys
    "background": BackgroundKeySupport,
    "content_scripts": ContentScriptsKeySupport,
    "permissions": PermissionsKeySupport,
    "web_accessible_resources": WebAccessibleResourcesKeySupport
};

function checker (manifest) {
    return Object.keys(manifest).map(function (key) {
        var s = null;

        if (support.hasOwnProperty(key)) {
            s = support[key](manifest[key]); 
        } else {
            s = new SupportStatus("NO_SUPPORT");
        }

        return {
            key: key,
            support: s
        };
    });
}

module.exports = checker;
