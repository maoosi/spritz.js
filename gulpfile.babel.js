// IMPORTS

import packageJSON from './package.json'
import path from 'path'

import browserSync from 'browser-sync'
import babelify from 'babelify'
import browserify from 'browserify'
import assign from 'lodash.assign'
import buffer from 'vinyl-buffer'
import source from 'vinyl-source-stream'
import gulp from 'gulp'

import eslint from 'gulp-eslint'
import autoprefixer from 'gulp-autoprefixer'
import sourcemaps from 'gulp-sourcemaps'
import notifier from 'node-notifier'
import header from 'gulp-header'
import uglify from 'gulp-uglify'
// import es3ify from 'gulp-es3ify'
import replace from 'gulp-replace';


// VARS

const folders = {
	src: './src',
	dist: './dist',
	sandbox: './sandbox'
}

const library = {
	name: 'spritz.js',
	filename: 'spritz.js',
	class: 'Spritz'
}


// ERROR HANDLER

const onError = function(error) {
	notifier.notify({ 'title': 'Error', 'message': 'Compilation failed.' })
	console.log(error)
}


// HEADER

const attribution = [
  '/*!',
  ' * ' + library.name + ' <%= pkg.version %> - <%= pkg.description %>',
  ' * Copyright (c) ' + new Date().getFullYear() + ' <%= pkg.author %> - <%= pkg.homepage %>',
  ' * License: <%= pkg.license %>',
  ' */'
].join('\n')


// LINT

gulp.task('lint', () => {
	return gulp.src(folders.src + '/**/*.js')
		.pipe(eslint())
		.pipe(eslint.format())
})


// BUNDLE

const browserifyArgs = {
    debug: true,
    entries: folders.src + '/' + library.filename,
    standalone: library.class
}

const bundler = browserify(browserifyArgs)

const build = () => {
	console.log('Bundling started...')
	console.time('Bundling finished')

	return bundler
        .transform('babelify', {
            plugins: ['transform-runtime', 'add-module-exports']
        })
		.bundle()
		.on('error', onError)
		.on('end', () => console.timeEnd('Bundling finished'))
		.pipe(source('spritz.min.js'))
		.pipe(buffer())
        //.pipe(es3ify())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(uglify())
        .pipe(replace(/\/\* == ([\s\S]*?) == \*\//g, ''))
        .pipe(replace(/(\\n){2,}/g, '\\n'))
        .pipe(replace(/ +/g, ' '))
        .pipe(replace(/: /g, ':'))
		.pipe(header(attribution, { pkg: packageJSON }))
		.pipe(sourcemaps.write('./', { addComment: false }))
		.pipe(gulp.dest(folders.dist))
        .pipe(server.reload({ stream: true }))
}

bundler.on('update', build)
gulp.task('js', ['lint'], build)


// SERVER

const server = browserSync.create()

const sendMaps = (req, res, next) => {
	const filename = req.url.split('/').pop()
	const extension = filename.split('.').pop()

	if(extension === 'css' || extension === 'js') {
		res.setHeader('X-SourceMap', '/' + filename + '.map')
	}

	return next()
}

const options = {
	notify: false,
	startPath: '/sandbox/',
	server: {
		baseDir: '.',
		middleware: [
	      sendMaps
	    ]
	}
}

gulp.task('browser-sync', ['js'], () => server.init(options))


// WATCH

gulp.task('watch', () => {
    gulp.watch([folders.src + '/**/*', folders.sandbox + '/**/*'], ['js'])
})


// DEFAULT TASK

gulp.task('default', ['browser-sync', 'watch'])
