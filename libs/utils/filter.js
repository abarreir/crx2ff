var Matcher = require('minimatch').Minimatch;
var SEP = require('path').sep;
var chalk = require('chalk');

const DEFAULT_EXCLUDES = '**/{.git,.hg,.svn,.DS_Store,*.pem}';

var Filter = function(excludeGlob) {
    excludeGlob = excludeGlob || DEFAULT_EXCLUDES;
    var matcher = new Matcher(excludeGlob);

    return function(path) {
        var stdPath = path.replace(SEP, '/');

        var skip = matcher.match(stdPath);
        if (skip) {
            console.log(chalk.yellow('Skipping', path));
        }

        return !skip;
    };
};

module.exports = Filter;
