var test = require('tap').test;

var Filter = require('./../libs/utils/filter');

test('default glob', function (t) {
    var f = Filter();

    t.ok(f('foo'));
    t.ok(!f('.git'), '.git folder filtered by default');
    t.ok(!f('.svn'), '.svn folder filtered by default');
    t.ok(!f('.hg'), '.hg folder filtered by default');
    t.ok(!f('.DS_Store'), '.DS_Store folder filtered by default');
    t.ok(!f('mykey.pem'), '.pem files filtered by default');

    t.ok(!f('some/path/.git'));

    t.end();
});

test('empty string glob', function (t) {
    var f = Filter('');
    
    t.ok(f('foo'));
    t.ok(!f('.git'), 'Default glob is not overidden');

    t.end();
});

test('very specific glob', function(t) {
    var f = Filter('i/really/do/not/want/this.file');

    t.ok(f('.git'), 'Default glob is now overriden');
    t.ok(!f('i/really/do/not/want/this.file'));

    t.end();
});
