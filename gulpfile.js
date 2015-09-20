var gulp = require("gulp")
var babel = require("gulp-babel")
var babelCompiler = require("babel/register")
var mocha = require("gulp-mocha")
var gutil = require("gulp-util")

gulp.task("babel", function () {
  return gulp.src("src/semishuffle.js")
    .pipe(babel())
    .pipe(gulp.dest("dist"))
})

gulp.task("mocha", ["babel"], function () {
  return gulp.src(['test/*.js'], { read: false })
    .pipe(mocha({ 
      reporter: 'min',
      compilers: {
        js: babelCompiler
      }
    }))
    .on('error', gutil.log);
})

gulp.task("watch", function (){
  gulp.watch(["src/**", "test/**"], ["mocha"]);
})

gulp.task("default", ["mocha"])