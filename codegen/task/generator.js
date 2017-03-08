/**
 * Created by zhuxijun on 16-4-27.
 */
var fs = require('fs');
var path = require('path');

var through = require('through2');
var Mustache = require('mustache');
var beautify = require('js-beautify').js_beautify;

module.exports = function (opts) {
    var template = null;
    if (opts && opts.template) {
        template = path.join(process.cwd(), opts.template);
    }
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return cb();
        }

        if (template) {
            var definition = require(file.history[0].toString());
            var _template = fs.readFileSync(template, 'utf-8');
            var source = Mustache.render(_template, definition);
            source = beautify(source, {indent_size: 4, max_preserve_newlines: 2});
            file.contents = new Buffer(source);
        }

        this.push(file);
        cb()
    });
};
