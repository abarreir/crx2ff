(() => {
    // Save global chrome object
    const gchrome = chrome;

    // Proxy the global chrome object and warn about missing props/func calls
    chrome = new Proxy(gchrome, {
        get: function(target, name) {
            return new Proxy(() => {}, {
                get: function (ptarget, pname) {
                    if (gchrome[name] && gchrome[name][pname]) {
                        return gchrome[name][pname];
                    } else {
                        var propsChain = "chrome." + name + "." + pname;
                        crx2ffwarn(propsChain + " not supported yet");
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

            apply: function (target, thisArg, argumentsList) {
                crx2ffwarn(propsChain + " called");
            }
        })
    }
})();
