// imports

const pkg      = require('./package.json')
const sync     = require('browser-sync')
const del      = require('del')
const fs       = require('fs')
const gulp     = require('gulp')
const notifier = require('node-notifier')
const rollup   = require('rollup')
const babel    = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const resolve  = require('rollup-plugin-node-resolve')
const eslint   = require('rollup-plugin-eslint')

// error handler

const onError = function(error) {
    notifier.notify({
        'title': 'Error',
        'message': 'Compilation failure.'
    })

    console.log(error)
}

// clean

gulp.task('clean', () => {
    return del(
        'dist/**.js',
        '!dist'
    )
})

// attribution

const attribution =
`/*!
* spritz.js ${ pkg.version } - ${ pkg.description }
* Copyright (c) ${ new Date().getFullYear() } ${ pkg.author } - ${ pkg.homepage }
* License: ${ pkg.license }
*/
`

// js

const read = {
    entry: 'src/spritz.js',
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            browser: true
        }),
        eslint(),
        commonjs(),
        babel()
    ]
}

const write = {
    umd: {
        format: 'umd',
        exports: 'default',
        moduleName: 'Spritz',
        banner: attribution,
        sourceMap: true
    },
    module: {
        format: 'es',
        banner: attribution
    }
}

gulp.task('js', () => {
    return rollup
    .rollup(read)
    .then(bundle => {
        // generate UMD and ES module from bundle
        const umd = bundle.generate(write.umd)
        const module = bundle.generate(write.module)

        // write JS files
        fs.writeFileSync(pkg.main, umd.code)
        fs.writeFileSync(pkg.module, module.code)

        // write sourcemap
        fs.writeFileSync('dist/maps/spritz.js.map', umd.map.toString())
    })
    .catch(onError)
})

// server

const server = sync.create()
const reload = sync.reload

const sendMaps = (req, res, next) => {
    const filename = req.url.split('/').pop()
    const extension = filename.split('.').pop()

    if(extension === 'css' || extension === 'js') {
        res.setHeader('X-SourceMap', '/maps/' + filename + '.map')
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
    },
    watchOptions: {
        ignored: '*.map'
    }
}

gulp.task('server', () => sync(options))

// watch

gulp.task('watch', () => {
    gulp.watch('src/**/*.js', ['js', reload])
})

// build and default tasks

const exists = path => {
    try {
        return fs.statSync(path).isDirectory()
    } catch(error) {}

    return false
}

gulp.task('build', ['clean'], () => {
    // create dist directories
    if(!exists('dist')) fs.mkdirSync('dist')
    if(!exists('dist/maps')) fs.mkdirSync('dist/maps')

    // run the tasks
    gulp.start('js')
})

gulp.task('default', ['build', 'server', 'watch'])
