import babel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-js-harmony'

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

export default {
    entry: './src/spritz.js',
    plugins: [
        babel(babelrc()),
        uglify({
            output: {
                comments: (node, comment) => {
                    return (comment.type === 'comment2' && /@license/i.test(comment.value))
                }
            }
        }, minify)
    ],
    targets: [
        {
            dest: pkg.main,
            format: 'umd',
            exports: 'default',
            moduleName: 'Spritz',
            banner: attribution,
            sourceMap: true
        },
        {
            dest: pkg.module,
            format: 'es',
            banner: attribution,
            sourceMap: true
        }
    ]
}
