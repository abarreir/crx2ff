var fs = require('fs');

function jsonReporter (report, output) {
    output = output || "crx2ff.json";
    fs.writeFile(output, JSON.stringify(report, null, 2));
}

module.exports = jsonReporter;
