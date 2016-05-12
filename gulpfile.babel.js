// IMPORTS

import packageJSON from './package.json'
import path from 'path'

import sync from 'browser-sync'
import babelify from 'babelify'
import browserify from 'browserify'
import watchify from 'watchify'
import assign from 'lodash.assign'
import buffer from 'vinyl-buffer'
import source from 'vinyl-source-stream'
import gulp from 'gulp'

import eslint from 'gulp-eslint'
import autoprefixer from 'gulp-autoprefixer'
import changed from 'gulp-changed'
import sourcemaps from 'gulp-sourcemaps'
import notifier from 'node-notifier'
import header from 'gulp-header'
import uglify from 'gulp-uglify'
import gutil from 'gulp-util'


// VARS

const folders = {
	src: './src',
	dist: './dist',
	demo: './demo'
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
  standalone: library.class,
  transform: [
	  'babelify'
  ]
}

const watchifyArgs = assign(watchify.args, browserifyArgs)
const bundler = watchify(browserify(watchifyArgs))

const build = () => {
	console.log('Bundling started...')
	console.time('Bundling finished')

	return bundler
		.bundle()
		.on('error', onError)
		.on('end', () => console.timeEnd('Bundling finished'))
		.pipe(source('spritz.min.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(uglify())
		.pipe(header(attribution, { pkg: packageJSON }))
		.pipe(sourcemaps.write('./', { addComment: false }))
		.pipe(gulp.dest(folders.dist))
		.pipe(sync.stream())
}

bundler.on('update', build)
gulp.task('js', ['lint'], build)


// SERVER

const server = sync.create()
const reload = sync.reload

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
	startPath: '/demo/',
	server: {
		baseDir: '.',
		middleware: [
	      sendMaps
	    ]
	},
	reloadDelay: 500,
    watchOptions: {
        ignored: '*.map'
    }
}

gulp.task('server', () => setTimeout(function(){ sync(options) }, 1000))


// WATCH

gulp.task('watch', () => {
    gulp.watch([folders.src + '/**/*', folders.demo + '/**/*'], ['js', reload])
})


// DEFAULT TASK

gulp.task('default', ['js', 'server', 'watch'])
