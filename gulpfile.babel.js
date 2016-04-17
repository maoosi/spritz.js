// IMPORTS

import packageJSON from './package.json'
import path from 'path'

import babelify from 'babelify'
import browserify from 'browserify'
import watchify from 'watchify'
import assign from 'lodash.assign'
import buffer from 'vinyl-buffer'
import source from 'vinyl-source-stream'
import gulp from 'gulp'

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
	dist: './dist'
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


// JS

const browserifyArgs = {
  debug: true,
  entries: folders.src + '/' + library.filename,
  standalone: library.className
}

const watchifyArgs = assign(watchify.args, browserifyArgs)
const bundler = watchify(browserify(watchifyArgs))

const build = () => {
	console.log('Bundling started...')
	console.time('Bundling finished')

	return bundler
		.transform(babelify.configure({
			presets: ['es2015'],
			plugins: ['add-module-exports']
		}))
		.bundle()
		.on('error', onError)
		.on('end', () => console.timeEnd('Bundling finished'))
		.pipe(source('spritz.min.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(header(attribution, { pkg: packageJSON }))
		.pipe(uglify({ preserveComments: 'some' }))
		.pipe(sourcemaps.write('./', { addComment: false }))
		.pipe(gulp.dest(folders.dist))
}

bundler.on('update', build)
gulp.task('js', build)


// WATCH

gulp.watch(folders.src + '/**/*.js', ['js'])
gulp.task('default', ['js'])
