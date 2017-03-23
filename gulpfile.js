/**
 * Created by zhuxijun on 16-4-27.
 */

var gulp = require('gulp');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var generator = require('./codegen/task/generator');

var option = {
  build: ['build/*'],
  definition: ['./codegen/defs/*.js']
}

var template = {
  mongoose_schema: './codegen/template/mongoose-schema.mustache',
  mongoose_dao: './codegen/template/mongoose-dao.mustache',
  business: './codegen/template/business.mustache',
  api: './codegen/template/api.mustache',
  inter: './codegen/template/interface.mustache',
}

gulp.task('clear', function () {
  return gulp.src(option.build)
    .pipe(clean());
});

gulp.task('model', function () {
  return gulp.src(option.definition)
    .pipe(generator({ template: template.mongoose_schema }))
    .pipe(gulp.dest('persistence/models/'));
});

gulp.task('dao', function () {
  return gulp.src(option.definition)
    .pipe(generator({ template: template.mongoose_dao }))
    .pipe(gulp.dest('persistence/dao/'));
});

/*gulp.task('business', function () {
  return gulp.src(option.definition)
    .pipe(generator({ template: template.business }))
    .pipe(gulp.dest('persistence/business/gen/'));
});*/

gulp.task('api', function () {
  return gulp.src(option.definition)
    .pipe(generator({ template: template.api }))
    .pipe(gulp.dest('persistence/api/'));
});

/*gulp.task('inter', function () {
  return gulp.src(option.definition)
    .pipe(generator({ template: template.inter }))
    .pipe(gulp.dest('persistence/interface/gen/'));
});*/

/*gulp.task('jsdoc', function () {
  return gulp.src(['interface/*', 'api/*', 'business/*', 'persistence/*'], { read: false })
    .pipe(jsdoc({
      "tags": {
        "allowUnknownTags": true
      },
      "opts": {
        "destination": "./docs/gen"
      },
      "plugins": [
        "plugins/markdown"
      ],
      "templates": {
        "cleverLinks": true,
        "monospaceLinks": false,
        "default": {
          "outputSourceFiles": true
        },
        "path": "ink-docstrap",
        "theme": "cerulean",
        "navType": "vertical",
        "linenums": true,
        "dateFormat": "MMMM Do YYYY, h:mm:ss a"
      }
    }));
});*/

gulp.task('default', ['clear', 'model', 'dao', 'api']);