var ftpConfig = require('./ftpConfig');
var pathN = ftpConfig.pathN;
var path = require('path');
var sftp = require('gulp-sftp');
var runSequence = require('gulp-sequence');
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
    imagemin = require('gulp-imagemin'),
    zip = require('gulp-zip'),
    ftp = require('gulp-ftp'),
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
    sass: './src/**/*.{scss,sass,css}',
    json: './src/**/*.json',
    pages: 'src/pages/*.html'
};
//添加zip压缩
gulp.task('zip',function () {
  gulp.src(['./dist/**/*'])
    .pipe(zip('dist.zip'))
    .pipe(gulp.dest('./'))
});


gulp.task('imgmin', function (done) {
  gulp.src(['src/i/**/*'])
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({plugins: [{removeViewBox: true}]})
    ]))
    .pipe(gulp.dest('dist/i')).on('end', done);
});
//将图片拷贝到目标目录并压缩
gulp.task('copy:images', function (done) {
    gulp.src(['src/i/**/*'])
      .pipe(gulp.dest('dist/i')).on('end', done);

});
//压缩合并css, css中既有自己写的.less, 也有引入第三方库的.css
gulp.task('sassmin', function (done) {
  gulp.src([src.sass, 'src/css/*.css'])
    .pipe(sass())
    //这里可以加css sprite 让每一个css合并为一个雪碧图
    //.pipe(spriter({}))
    //自动前缀
    .pipe(autoprefixer({
      browsers: ["last 1 version", "> 5%", "> 5% in US", "ie 9", "ie 8", 'Android >= 4.0','Firefox < 20'],
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
    .pipe(gulp.dest('dist/'))
    .pipe(connect.reload())
    .on('end', done)
});
//将js加上10位md5,并修改html中的引用路径，该动作依赖build-js
gulp.task('md5:js', ['build-js'], function (done) {
    gulp.src('dist/js/*.js')
        .pipe(md5(10, 'dist/*.html'))
        .pipe(gulp.dest('dist/js'))
        .on('end', done);
});
//将css加上10位md5，并修改html中的引用路径，该动作依赖sprite
gulp.task('md5:css', function (done) {
    gulp.src('dist/css/*.css')
        .pipe(md5(10, 'dist/*.html'))
        .pipe(gulp.dest('dist/css'))
        .on('end', done);
});
//雪碧图操作，应该先拷贝图片并压缩合并css
gulp.task('sprite', ['copy:images', 'sassmin'], function (done) {
    var timestamp = +new Date();
    gulp.src('dist/css/style.min.css')
        .pipe(spriter({
            spriteSheet: 'dist/i/spritesheet' + timestamp + '.png',
            pathToSpriteSheetFromCSS: './spritesheet.png',
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
            uri: 'http://localhost:3000/'
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
gulp.task('watch', function (done) {
  gulp.watch('src/**/*', ['sassmin', 'build-js', 'fileinclude', 'copy:images'])
    .on('end', done);
});

// var proName = process.env.npm_package_name;
//注册 ftp 任务

gulp.task('ftp-nw',function () {
  gulp.src(['dist/*.html','dist/**/*.css','dist/**/*'])
    .pipe(sftp(ftpConfig.nw))
  gulp.src('dist/**/*.js')
    .pipe(sftp(ftpConfig.nw))
    .pipe(gutil.noop());
});

gulp.task('open-nw', function (done) {
    gulp.src('')
      .pipe(gulpOpen({
        app: browser,
        uri: 'http://10.0.120.212/chenjinxin/' + pathN
      }))
      .on('end', done);
});

gulp.task('ftp-ww',function () {
  setTimeout(function () {
    gulp.src(['dist/*.html','dist/**/*.css','dist/**/*'])
      .pipe(sftp(ftpConfig.ww))
    gulp.src('dist/**/*.js')
      .pipe(sftp(ftpConfig.ww))
      .pipe(gutil.noop());
  },1000)

});

gulp.task('open-ww', function (done) {
  gulp.src('')
    .pipe(gulpOpen({
      app: browser,
      uri: 'http://club.weather.com.cn/ski/' + pathN + '/'
    }))
    .on('end', done);
});


gulp.task('ftp-wx',function () {
  gulp.src(['dist/*.html','dist/**/*.css','dist/**/*'])
    .pipe(ftp(ftpConfig.wx));
  gulp.src('dist/**/*.js')
    .pipe(ftp(ftpConfig.wx))
    .pipe(gutil.noop());
});

gulp.task('open-wx', function (done) {
  setTimeout(function () {
    gulp.src('')
      .pipe(gulpOpen({
        app: browser,
        uri: 'http://wxtq.weather.com.cn/wx/' + pathN + '/'
      }))
      .on('end', done);
  }, 10000)
});

//内网
//gulp.task('ftp_nw',runSequence('clean','imgmin',['fileinclude', 'sassmin', 'build-js','fonts', 'json'],'md5:css', 'md5:js', 'ftp-nw', 'open-nw'));
//外网
gulp.task('ftp_ww', runSequence('clean','imgmin',['fileinclude', 'sassmin', 'build-js','fonts', 'json'], 'md5:css', 'md5:js','ftp-ww', 'open-ww'));
//微信
gulp.task('ftp_wx', runSequence('clean','imgmin',['fileinclude', 'sassmin', 'build-js','fonts', 'json'], 'md5:css', 'md5:js','ftp-wx', 'open-wx'));
//发布
gulp.task('dist', ['imgmin', 'fileinclude', 'sassmin', 'build-js','fonts', 'json','fileinclude']);

//开发
gulp.task('dev', ['connect', 'copy:images', 'fileinclude', 'sassmin', 'build-js','fonts', 'json','open','watch']);

//清除
gulp.task('clean', function () {del(['dist/**/*']);});






