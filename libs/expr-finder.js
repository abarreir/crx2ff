var fs = require('fs');
var esprima = require('esprima');
var estraverse = require('estraverse');

var propertyChain = [],
    nodes = 0,
    depth = 0,
    foundChrome = false,
    chromeDepth = 0,
    chromeLocation = null,
    propsSinceChrome = 0;

var apiExpressions;

// Build an AST of the provided file and look for chrome api expressions like
//  - chrome.tabs.query(...)
//  - foo(chrome.runtime.id)
//  - if (chrome.runtime && chrome.runtime.lastError) { ... }
//  - ...
//
// The result is an object whose keys represent unique API expressions found
// in the file, and key values containing the position of each given expression
// instance on the file. 
function processFile (filepath) {
    var fileContent = fs.readFileSync(filepath);
    var tree = esprima.parse(fileContent, {
        loc: true
    });

    apiExpressions = {};

    estraverse.traverse(tree, {
        enter: enter,
        leave: leave
    });

    return apiExpressions;
}

function enter (node, parent) {
    var parentIsMember,
        parentIsCall;

    ++depth; ++nodes;

    if (node.type !== "Identifier")
        return;

    parentIsMember = parent && parent.type === "MemberExpression";
    parentIsCall = parent && parent.type === "CallExpression";

    if (node.name === "chrome" && parentIsMember && parent.property !== node) {
        foundChrome = true;
        chromeLocation = node.loc;
        chromeDepth = depth;
        propsSinceChrome = nodes;

        propertyChain.push(node.name);
    } else if (node.name !== "chrome" && foundChrome && (!parentIsCall)
                && (depth < chromeDepth || nodes - propsSinceChrome === 1)) {
        chromeDepth = depth;
        propertyChain.push(node.name);
    }
}

function leave (node, parent) {
    var parentIsCall,
        parentIsMember,
        nodeIsCallMember;

    --depth;

    if (!foundChrome) {
        return;
    }

    parentIsMember = parent && parent.type === "MemberExpression";
    parentIsCall = parent && parent.type === "CallExpression";
    nodeIsCallMember = parentIsCall && parent.callee === node;

    if (parentIsCall && nodeIsCallMember || !parentIsMember) {
        treatApiExpression(propertyChain, chromeLocation);
        foundChrome = false;
        propertyChain = [];
    }
}

function treatApiExpression (propertyChain, location) {
    var expr = propertyChain.join('.');

    if (apiExpressions.hasOwnProperty(expr)) {
        apiExpressions[expr].push(location.start);
    } else {
        apiExpressions[expr] = [location.start];
    }
}

module.exports = processFile;
