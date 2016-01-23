var gulp = require('gulp');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');

gulp.task('server', function () {
    nodemon({
        script: 'server.js'
        , ext: 'js html'
          , env: { 'NODE_ENV': 'development' }
    })
});

gulp.task('styles', function(){
    return gulp.src(['stylesheets/**.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch('stylesheets/**.scss', ['styles']);
});

gulp.task('default', ['server','watch','styles']);
