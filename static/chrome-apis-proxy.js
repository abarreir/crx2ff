(() => {
    // Save global chrome object
    const gchrome = chrome;
    const CONTEXT = (() => {
        try {
            var protocol = window.location.protocol;
            if (protocol === "chrome-extension:" || protocol === "moz-extension:") {
                return "background";
            }
            else {
                return "content script";
            }
        }
        catch (e) {
            return "content script";
        }
    })();

    // Proxy the global chrome object and warn about missing props/func calls
    chrome = new Proxy(gchrome, {
        get: function(target, name) {
            return new Proxy(() => {}, {
                get: function (ptarget, pname) {
                    if (gchrome[name] && gchrome[name][pname]) {
                        return gchrome[name][pname];
                    } else if (pname === 'lastError') {
                        return undefined;
                    } else {
                        var propsChain = "chrome." + name + "." + pname;
                        crx2ffwarn(propsChain + " not supported in " + CONTEXT);
                        return recursiveProxy(propsChain);
                    }
                }
            });
        }
    });

    function crx2ffwarn (msg) {
        console.warn("[crx2ff] " + msg);
    }

    function recursiveProxy (propsChain) {
        return new Proxy(() => {}, {
            get: function (target, name) {
                return recursiveProxy(propsChain + "." + name);
            },

            apply: function () {
                crx2ffwarn(propsChain + " called in " + CONTEXT);
            }
        })
    }
})();
