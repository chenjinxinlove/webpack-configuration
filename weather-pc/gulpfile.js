/**
*/

var gulp = require('gulp'),
    del = require('del'),
    os = require('os'),
    gutil = require('gulp-util'),
    sass= require('gulp-sass'),
    concat = require('gulp-concat'),
    gulpOpen = require('gulp-open'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-cssmin'),
    md5 = require('gulp-md5-plus'),
    fileinclude = require('gulp-file-include'),
    clean = require('gulp-clean'),
    spriter = require('gulp-css-spriter'),
    base64 = require('gulp-css-base64'),
    webpack = require('webpack'),
    webpackConfig = require('./webpack.config.js'),
    watch = require('gulp-watch'),
    connect = require('gulp-connect'),
    autoprefixer = require('gulp-autoprefixer');

var host = {
    path: 'dist/',
    port: 3000,
    html: 'index.html'
};

//mac chrome: "Google chrome",
var browser = os.platform() === 'linux' ? 'Google chrome' : (
  os.platform() === 'darwin' ? 'Google chrome' : (
  os.platform() === 'win32' ? 'chrome' : 'firefox'));
var src  = {
    fonts: './src/**/*.{eot,svg,ttf,woff}',
    images: './src/**/*.{png,jpg,jpeg,svg}',
    js: './src/**/*.js',
    sass: './src/**/*.{scss,sass}',
    json: './src/**/*.json',
    pages: 'src/pages/*.html'
};

//将图片拷贝到目标目录
gulp.task('copy:images', function (done) {
    gulp.src(['src/images/**/*']).pipe(gulp.dest('dist/images')).on('end', done);
});
//压缩合并css, css中既有自己写的.less, 也有引入第三方库的.css
gulp.task('sassmin', function (done) {
  gulp.src([src.sass, 'src/css/*.css'])
    .pipe(sass())
    //这里可以加css sprite 让每一个css合并为一个雪碧图
    .pipe(spriter({}))
    //自动前缀
    .pipe(autoprefixer({
      browsers: ['> 5%', 'Android >= 4.0'],
      cascade: true, //是否美化属性值 默认：true 像这样：
      remove:true //是否去掉不必要的前缀 默认：true
    }))
    .pipe(cssmin())
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest('dist/css/'))
    .pipe(connect.reload())
    .on('end', done);
});
//用于在html文件中直接include文件
gulp.task('fileinclude', function (done) {
  gulp.src([src.pages])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('dist/pages'))
    .on('end', done)
    .pipe(connect.reload());
});
//将js加上10位md5,并修改html中的引用路径，该动作依赖build-js
gulp.task('md5:js', ['build-js'], function (done) {
    gulp.src('dist/js/*.js')
        .pipe(md5(10, 'dist/pages/*.html'))
        .pipe(gulp.dest('dist/js'))
        .on('end', done);
});
//将css加上10位md5，并修改html中的引用路径，该动作依赖sprite
gulp.task('md5:css', ['sprite'], function (done) {
    gulp.src('dist/css/*.css')
        .pipe(md5(10, 'dist/pages/*.html'))
        .pipe(gulp.dest('dist/css'))
        .on('end', done);
});
//雪碧图操作，应该先拷贝图片并压缩合并css
gulp.task('sprite', ['copy:images', 'sassmin'], function (done) {
    var timestamp = +new Date();
    gulp.src('dist/css/style.min.css')
        .pipe(spriter({
            spriteSheet: 'dist/images/spritesheet' + timestamp + '.png',
            pathToSpriteSheetFromCSS: '../images/spritesheet' + timestamp + '.png',
            spritesmithOptions: {
                padding: 10
            }
        }))
        .pipe(base64())
        .pipe(cssmin())
        .pipe(gulp.dest('dist/css'))
        .on('end', done);
});
//处理字体
gulp.task('fonts', function () {
    watch([src.fonts]).on('change', function () {
      gulp.src(src.fonts)
        .pipe(gulp.dest(dist));
    }).on('add', function () {
      gulp.src(src.fonts)
        .pipe(gulp.dest(dist));
    })
});
//处理json
gulp.task('json', function () {
    watch([src.json]).on('change', function () {
      gulp.src(src.json)
        .pipe(gulp.dest(dist))
    });
});
gulp.task('clean', function (done) {
    gulp.src(['dist'])
        .pipe(clean())
        .on('end', done);
});
gulp.task('connect', function () {
    console.log('connect------------');
    connect.server({
        root: host.path,
        port: host.port,
        livereload: true
    });
});
gulp.task('open', function (done) {
    gulp.src('')
        .pipe(gulpOpen({
            app: browser,
            uri: 'http://localhost:3000/pages'
        }))
        .on('end', done);
});
var myDevConfig = Object.create(webpackConfig);
var devCompiler = webpack(myDevConfig);

//引用webpack对js进行操作
gulp.task("build-js", ['fileinclude'], function(callback) {
    devCompiler.run(function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build-js", err);
        gutil.log("[webpack:build-js]", stats.toString({
            colors: true
        }));
        callback();
    });
});

//发布
gulp.task('dist', ['fileinclude', 'md5:css', 'md5:js']);

//开发
gulp.task('dev', ['connect', 'copy:images', 'fileinclude', 'sassmin', 'build-js', 'open' ,'fonts', 'json']);

//清除
gulp.task('clean', function () {del(['dist/**/*']);});
