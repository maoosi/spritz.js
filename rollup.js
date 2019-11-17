const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const minify = require('uglify-js-harmony')
const terser = require('rollup-plugin-terser').terser

let pkg = require('./package.json')

const attribution =
`/*!
* ${ pkg.name } ${ pkg.version } - ${ pkg.description }
*
* @author       ${ pkg.author }
* @homepage     ${ pkg.homepage }
* @copyright    Copyright (c) ${ new Date().getFullYear() } ${ pkg.author }
* @license      ${ pkg.license }
* @version      ${ pkg.version }
*/
`

rollup.rollup({
    input: 'src/spritz.js',
    plugins: [
        babel(),
        resolve(),
        terser({
            output: {
                comments: (node, comment) => {
                    return (comment.type === 'comment2' && /@license/i.test(comment.value))
                }
            }
        }, minify)
    ]
}).then((bundle) => {
    bundle.write({
        file: pkg.main,
        format: 'umd',
        name: 'Spritz',
        banner: attribution,
        sourcemap: true
    })
    bundle.write({
        file: pkg.module,
        format: 'esm',
        banner: attribution,
        sourcemap: true
    })
})