var gulp = require('gulp');
var sass = require('gulp-sass');
var neat = require('node-neat').includePaths;
var nodemon = require('gulp-nodemon');

var paths = {
    scss: './public/css/*.scss'
};

gulp.task('server', function () {
    nodemon({
        script: 'app.js'
        , ext: 'js html'
        , env: { 'NODE_ENV': 'development' }
    })
});

gulp.task('jshint', function () {
    gulp.src('client/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
    gulp.src('server/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('styles', function(){
    return gulp.src(paths.scss)
        .pipe(sass({
            includePaths: ['styles'].concat(neat)
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function() {
    gulp.watch(paths.scss, ['styles']);
});

gulp.task('default', ['server','watch','styles']);
