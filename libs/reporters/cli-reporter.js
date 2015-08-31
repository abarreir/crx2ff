var chalk = require('chalk');

function prettifyStatus (status) {
    var symbols = {
        ok: '✓',
        info: 'ℹ',
        warn: '⚠',
        err: '✖'
    };

    if (process.platform === 'win32') {
        symbols.ok = '\u221A';
        symbols.info = '\u2139';
        symbols.warn = '\u26A0';
        symbols.err = '\u00D7';
    }

    if (status.type === "SUPPORT") {
        return chalk.green(symbols.ok);
    }

    if (status.type === "NO_SUPPORT") {
        return chalk.red(symbols.err);
    }

    if (status.type === "WARN") {
        return chalk.yellow(symbols.warn + " " + status.msg);
    }

    if (status.type === "FUTURE_SUPPORT") {
        return chalk.gray.bgBlue(symbols.info + " upcoming");
    }

    return status.type;
}

function printReport (report) {
    Object.keys(report.used).sort().forEach(function (api) {
        console.log(chalk.white.bold.bgMagenta("chrome." + api));

        var apiExprs = report.used[api];

        Object.keys(apiExprs).sort().forEach(function (expr) {
            console.log("  ." + expr + " " + prettifyStatus(apiExprs[expr].status));

            apiExprs[expr].filesLocations.forEach(function (file) {
                console.log("     " + file.file);

                file.locations.forEach(function (loc) {
                    console.log("       - line: " + loc.line + ", col: " + loc.column);
                });
            });

            console.log("");
        });
    });
}

module.exports = printReport;
