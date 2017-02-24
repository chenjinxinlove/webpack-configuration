/**
 * Created by chen on 2017/2/24.
 */
let path = require('path');
let gulp = require('gulp');
let del = require('del');
let watchPath = require('gulp-watch-path');
let rename = require('gulp-rename');
let sass = require('gulp-sass');
let base64 = require('gulp-base64');
let named  = require('vinyl-named');
let webpackStream = require('webpack-stream');
let webpack = require('webpack');
let watch = require('gulp-watch');

var webpackConfig = {
    resolve: {
        root: path.join(__dirname, 'node_modules'),
        extensions: ['', '.js', '.scss', '.css']
    },
    output: {
        filename: '[name].js',
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel', exclude: /node_modules/ },
        ]
    },
    plugins: [],
    babel: { //配置babel
        "presets": ["es2015", 'stage-2'],
        "plugins": ["transform-runtime"]
    }
};

var src  = {
    fonts: './src/**/*.{eot,svg,ttf,woff}',
    images: './src/**/*.{png,jpg,jpeg,svg}',
    js: './src/**/*.js',
    sass: './src/**/*.{scss,less,sass}',
    wxss: './src/**/*.wxss',
    wxml: './src/**/*.wxml',
    json: './src/**/*.json',
    views: './src/**/*.{html,wxml}'
};
const dist = './dist/';

gulp.task('clean', function () {
    del([
        'dist/**/*'
    ]);
});

gulp.task('dev', function () {
    gulp.start('views','sass', 'wxss', 'images', 'fonts', 'js', 'json');
});

gulp.task('views', function () {
    watch([src.views]).on('change', function () {
        views();
    })
});
function views() {
    gulp.src(src.views)
        .pipe(rename({
            extname:".wxml"
        }))
        .pipe(gulp.dest(dist));
}

gulp.task('sass', function () {
    watch([src.sass], function (e) {
        var paths = watchPath(e, src.sass, dist);

        if (paths.srcPath.indexOf('.scss') > -1 || paths.srcPath.indexOf('.sass') > -1) {
            return compileSass(src.sass, 'dist')
        }

    })
});

function compileSass(src, dist) {
    return gulp.src(src)
        .pipe(sass().on('error', sass.logError))
        .pipe(base64({
            extensions: ['png', /\.jpg#datauri$/i],
            maxImageSize: 10 * 1024
        }))
        .pipe(rename({
            extname: ".wxss"
        }))
        .pipe(gulp.dest(dist))
}

gulp.task('wxss', function () {
    watch([src.wxss], function (e) {
        var paths = watchPath(e, src.wxss, dist);
        compileWxss(paths.srcPath, paths.srcDir.replace('src', 'dist')); // 编译 .wxss
    })
});

function compileWxss(src, dist) {
    return gulp.src(src)
        .pipe(base64({
            extensions: ['png', /\.jpg#datauri$/i],
            maxImageSize: 10 * 1024 // bytes,
        }))
        .pipe(gulp.dest(dist))
}

gulp.task('images', function () {
    watch([src.images]).on('change', function () {
        image();
    }).on('add', function () {
        image();
    })
});

function image() {
    gulp.src(src.images)
        .pipe(gulp.dest(dist));
}

gulp.task('fonts', function () {
    watch([src.fonts]).on('change', function () {
        fonts()
    }).on('add', function () {
        fonts();
    })
});

function fonts() {
    gulp.src(src.fonts)
        .pipe(gulp.dest(dist));
}

gulp.task('js', function () {
    watch([src.js], function (event) {
        var paths = watchPath(event, src.js, dist);
        compileJS(paths.srcPath);
    })
});

function compileJS(path) {
    return gulp.src(path)
        .pipe(named(function (file) {
            var path   = JSON.parse(JSON.stringify(file)).history[0];
            var sp     = path.indexOf('\\') > -1 ? 'src\\' : 'src/';
            var target = path.split(sp)[1];
            return target.substring(0, target.length - 3);
        }))
        .pipe(webpackStream(webpackConfig))
        .on('error', function (err) {
            this.end()
        })
        .pipe(gulp.dest(dist))
}

gulp.task('json', function () {
    watch([src.json]).on('change', function () {
        json()
    });
});

function json() {
    gulp.src(src.json)
        .pipe(gulp.dest(dist))
}