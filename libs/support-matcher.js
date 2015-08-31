var ffApis = require('./firefox-apis');
var chApis = require('./chrome-apis');

function SupportStatus (type, msg) {
    this.type = type;
    this.msg = msg;
}

function match (chromeExpr) {
    var parsed = chApis.parseApiExpression(chromeExpr);

    if (!parsed) {
        return {
            status: new SupportStatus("UNKNOWN_API")
        };
    }

    if (!(parsed.api in ffApis)) {
        return {
            api: parsed.api,
            status: new SupportStatus("NO_SUPPORT")
        };
    }

    // Clean up event listeners callers
    var prop = parsed.property;
    var listener = prop.match(/(.addListener|.removeListener)/);

    if (listener !== null) {
        prop = prop.substr(0, prop.indexOf(listener[0]));
    }

    return {
        api: parsed.api,
        property: prop,
        status: ffApis[parsed.api](parsed.property)
    };
}

module.exports = match;
