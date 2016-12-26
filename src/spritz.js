import knot from 'knot.js'
import Wait from './wait.js'

export default class Spritz {

    /**
        --- CORE ---
    **/

    constructor (selector, options = {}) {
    // instance constructor
        this.options = {
            picture: options.picture || [],
            width: options.width || 0,
            height: options.height || 0,
            steps: options.steps || 1,
            rows: options.rows || 1
        }

        this.selector = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector

        this.emitter = knot()
        this.waitter = new Wait()
        this.supportsWebP = this._supportsWebP()

        this.initiated = false

        return this
    }

    _globalVars () {
    // global vars
        this.canvas = false
        this.ctx = false
        this.loaded = false

        this.columns = this.options.steps / this.options.rows
    }

    _throttle (callback, delay) {
    // throttle function
        let last
        let timer

        return () => {
            let context = this
            let now = +new Date()
            let args = arguments

            if (last && now < last + delay) {
                clearTimeout(timer)
                timer = setTimeout(() => {
                    last = now
                    callback.apply(context, args)
                }, delay)
            } else {
                last = now
                callback.apply(context, args)
            }
        }
    }

    _bindEvents () {
    // create events listeners
        this.resize = this._throttle((event) => {
            this._resize()
        }, 250)

        window.addEventListener('resize', this.resize, false)
    }

    _unbindEvents () {
    // remove events listeners
        window.removeEventListener('resize', this.resize, false)
    }

    _resize () {
    // viewport resize triggered
        this._loadPicture()
        this.emitter.emit('resize')
    }

    /**
        --- API ---
    **/

    init (step = 1) {
    // init vars, canvas, and snake
        if (!this.initiated) {
            this.step = step

            this._globalVars()
            this._bindEvents()
            this._createCanvas()
            this._loadPicture()

            this.initiated = true
            this.emitter.emit('init')
        }

        return this
    }

    destroy () {
    // destroy snake & instance
        this.waitter.handle(() => {
            if (this.initiated) {
                // stop stuff
                this.stop()
                this._unbindEvents()

                // reset & remove canvas
                this.canvas.parentNode.removeChild(this.canvas)
                this.canvas = false
                this.ctx = false

                // turn initiated to false
                this.initiated = false

                // emitt destroy
                this.emitter.emit('destroy')

                // turn off emitters
                this.emitter.off('init')
                this.emitter.off('destroy')
                this.emitter.off('resize')
                this.emitter.off('play')
                this.emitter.off('load')
                this.emitter.off('playback')
                this.emitter.off('wait')
                this.emitter.off('pause')
                this.emitter.off('stop')
            }
        })

        return this
    }

    play (fps) {
    // play animation
        this.waitter.handle(() => {
            this._playAnimation()

            console.log('playing')

            this.emitter.emit('play')
        })

        return this
    }

    playback (fps) {
    // play animation
        this.waitter.handle(() => {
            this._playAnimation()

            console.log('playing backwards')

            this.emitter.emit('playback')
        })

        return this
    }

    pause (silent = false) {
    // stop animation
        this.waitter.handle(() => {
            this._pauseAnimation()

            if (!silent) {
                console.log('paused')
                this.emitter.emit('pause')
            }
        })

        return this
    }

    stop () {
    // stop animation
        this.waitter.handle(() => {
            this.pause(true)
            this._resetAnimation()

            console.log('stopped')

            this.emitter.emit('stop')
        })

        return this
    }

    wait (milliseconds = 0) {
    // chainable timeout
        this.waitter.handle(() => {
            this.emitter.emit('wait')
            console.log('waiting for ' + milliseconds + 'ms')
        }, milliseconds)

        return this
    }

    step (step = 1) {
    // Change the current frame/step
        this.waitter.handle(() => {
            this.step = step
            this._draw()
        })

        return this
    }

    on (...args) { return this.emitter.on(...args) }
    off (...args) { return this.emitter.off(...args) }
    once (...args) { return this.emitter.once(...args) }

    /**
        --- ANIMATE ---
    **/

    _resetAnimation () {
    // reset animation to its initial state

    }

    _playAnimation () {
    // start animation
        this.anim = window.requestAnimationFrame((timestamp) => {
            // this._animStep(timestamp)
        })
    }

    _pauseAnimation () {
    // pause animation
        if (this.anim) {
            window.cancelAnimationFrame(this.anim)
            this.anim = false
            this.animStarter = false
        }
    }

    /**
        --- DETECT & CALCULATE ---
    **/

    _selectPicture () {
    // select picture src from list
        for (let i = 0; i < this.options.picture.length; i++) {
            let pic = this.options.picture[i]
            if (this._supportsFormat(pic.srcset) && this._matchesMedia(pic.media)) {
                this.pic = pic
                return pic.srcset
            }
        }
        return false
    }

    _supportsFormat (filename) {
    // return true if filename is a supported format
        let ext = this._getExtension(filename)
        return (ext === 'webp' && this.supportsWebP) || ext !== 'webp'
    }

    _supportsWebP () {
    // return true if webP is supported
        let canvas = document.createElement('canvas')
        canvas.width = canvas.height = 1
        return canvas.toDataURL && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    }

    _getExtension (filename) {
    // return filename extension
        return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined
    }

    _matchesMedia (query = undefined) {
    // return true if matches the media query
        let mq = window.matchMedia(query)
        return query !== undefined ? mq.matches : true
    }

    _setDimensions () {
    // calculate sprite dimensions
        this.stepWidth = this.pic.width / this.columns
        this.stepHeight = this.pic.height / this.options.rows
        this.stepRatio = this.stepWidth / this.stepHeight

        this.parentWidth = this.selector.clientWidth
        this.parentHeight = this.selector.clientHeight
        this.parentRatio = this.parentWidth / this.parentHeight

        if (this.stepRatio >= this.parentRatio) {
            this.canvasWidth = this.parentWidth
            this.canvasHeight = (this.stepHeight * this.canvasWidth) / this.stepWidth
        } else {
            this.canvasHeight = this.parentHeight
            this.canvasWidth = (this.stepWidth * this.canvasHeight) / this.stepHeight
        }

        this.canvas.width = this.canvasWidth
        this.canvas.height = this.canvasHeight
    }

    /**
        --- CREATE & DRAW ---
    **/

    _loadPicture () {
    // load source picture
        this.picture = new Image()
        this.picture.onload = () => {
            if (!this.loaded) {
                this.emitter.emit('load')
                this.loaded = true
            }
            this._draw()
        }
        this.picture.src = this._selectPicture()
        console.log(this.picture.src)
    }

    _draw () {
    // draw sprite
        this._setDimensions()
        this._drawPicture()
    }

    _drawPicture () {
    // draw picture into canvas
        let targetColumn = this.step % this.columns
        let targetRow = Math.ceil(this.step / this.columns)

        let posX = (targetColumn - 1) * this.stepWidth
        let posY = (targetRow - 1) * this.stepHeight

        console.log(targetColumn)
        console.log(targetRow)
        console.log(posX)
        console.log(posY)

        this.ctx.drawImage(
            this.picture,
            posX, posY,
            this.stepWidth,
            this.stepHeight,
            0, 0,
            this.canvasWidth,
            this.canvasHeight
        )
    }

    _createCanvas () {
    // create html5 canvas
        this.canvas = document.createElement('canvas')
        this.canvas.setAttribute('style', 'position:absolute;left:50%;top:50%;z-index:1;transform:translateY(-50%) translateY(1px) translateX(-50%) translateX(1px);')
        this.selector.appendChild(this.canvas)
        this.ctx = this.canvas.getContext('2d')
    }

}
