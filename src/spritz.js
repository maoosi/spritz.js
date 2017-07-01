import knot from 'knot.js'
import Wait from 'wait.js'

class Spritz {

    /**
        --- CORE ---
    **/

    constructor (selector, options = {}) {
    // instance constructor
        this.options = {
            picture: options.picture || [],
            steps: options.steps || 1,
            rows: options.rows || 1,
            init: (typeof options.init !== 'undefined') ? options.init : 1,
            testunit: options.testunit || false
        }

        if (! Array.isArray(this.options.picture)) this.options.picture = [this.options.picture]

        this.selector = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector

        this.emitter = knot()
        this.waitter = Wait()
        this.supportsWebP = this._supportsWebP()

        this.initiated = false

        return (this.options.init > 0)
            ? this.init(this.options.init)
            : this
    }

    _globalVars () {
    // global vars
        this.canvas = false
        this.ctx = false
        this.loaded = false
        this._resetUntil()
        this.anim = false
        this.columns = Math.ceil(this.options.steps / this.options.rows)
        this.currentFps = 15
        this.flipped = false
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
        this.resize = this._throttle(() => {
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
        this.emitter.emit('resize', this.pic)
    }

    /**
        --- API ---
    **/

    init (step = 1) {
    // init the sprite
        return this.waitter.handle(this, () => {
            if (!this.initiated) {
                this.initialStep = step
                this.currentStep = step

                this._globalVars()
                this._bindEvents()
                this._createCanvas()
                this._loadPicture()

                this.initiated = true
                this.emitter.emit('ready')
            }
        })
    }

    destroy () {
    // destroy sprite instance
        return this.waitter.handle(this, () => {
            if (this.initiated) {
                // stop stuff
                this.stop()
                this._unbindEvents()

                // reset & remove canvas
                this.canvas.parentNode.removeChild(this.canvas)
                this.container.parentNode.removeChild(this.container)
                this.canvas = false
                this.ctx = false

                // turn initiated to false
                this.initiated = false

                // emitt destroy
                this.emitter.emit('destroy')

                // turn off emitters
                this.emitter.off('ready')
                this.emitter.off('destroy')
                this.emitter.off('resize')
                this.emitter.off('play')
                this.emitter.off('load')
                this.emitter.off('change')
                this.emitter.off('wait')
                this.emitter.off('flip')
                this.emitter.off('pause')
                this.emitter.off('stop')
            }
        })
    }

    play (direction = false) {
    // play animation forward
        return this.waitter.handle(this, () => {
            this.animDirection = (direction === 'backward') ? 'backward' : 'forward'
            this._startAnimation()

            this.emitter.emit('play', this.animDirection)
        })
    }

    playback () {
    // play animation backward
        return this.waitter.handle(this, () => {
            this.animDirection = 'backward'
            this._startAnimation()

            this.emitter.emit('play', this.animDirection)
        })
    }

    pause (silent = false) {
    // pause animation
        return this.waitter.handle(this, () => {
            this._pauseAnimation()

            if (!silent) {
                this.emitter.emit('pause')
            }
        })
    }

    stop () {
    // stop animation (= pause + reset)
        return this.waitter.handle(this, () => {
            this.pause(true)
            this.step(this.initialStep)

            this.emitter.emit('stop')
        })
    }

    wait (milliseconds = 0) {
    // chainable timeout
        return this.waitter.handle(this, () => {
            this.emitter.emit('wait', milliseconds)
        }, milliseconds)
    }

    step (step = 1) {
    // change the current frame/step
        return this.waitter.handle(this, () => {
            let fromStep = this.currentStep
            this.currentStep = step
            this._draw()

            this.emitter.emit('change', fromStep, this.currentStep)
        })
    }

    fps (speed) {
    // change animation speed
        return this.waitter.handle(this, () => {
            this.currentFps = speed
        })
    }

    until (step, loop = 1) {
    // next animation will stop at this
        return this.waitter.handle(this, () => {
            this.stopAtStep = step
            this.stopAtLoop = loop
        })
    }

    next () {
    // go to the next frame
        return this.waitter.handle(this, () => {
            this.animDirection = 'forward'
            let fromStep = this.currentStep
            this.currentStep = this._targetStep()
            this._draw()

            this.emitter.emit('change', fromStep, this.currentStep)
        })
    }

    prev () {
    // go to the previous frame
        return this.waitter.handle(this, () => {
            this.animDirection = 'backward'
            let fromStep = this.currentStep
            this.currentStep = this._targetStep()
            this._draw()

            this.emitter.emit('change', fromStep, this.currentStep)
        })
    }

    get (data, callback = false) {
    // return data, then call the callback function with result
        return this.waitter.handle(this, () => {
            switch (data) {
                case 'step':
                    return callback !== false ? callback.call(this, this.currentStep) : this.currentStep
                case 'picture':
                    return callback !== false ? callback.call(this, this.pic) : this.pic
                default:
                    return false
            }
        })
    }

    flip () {
    // flip the sprite horizontally
        return this.waitter.handle(this, () => {
            let css = this.flipped
                ? 'width:100%;height:100%;'
                : 'width:100%;height:100%;-webkit-transform:scale(-1, 1);-ms-transform:scale(-1, 1);transform:scale(-1, 1);-webkit-filter:FlipH;filter:FlipH;'

            this.container.setAttribute('style', css)
            this.flipped = !this.flipped
            this.emitter.emit('flip')
        })
    }

    on (...args) { return this.emitter.on(...args) }
    off (...args) { return this.emitter.off(...args) }

    /**
        --- ANIMATE ---
    **/

    _resetUntil () {
    // reset the "until()" api command
        this.stopAtLoop = false
        this.stopAtStep = false
    }

    _targetStep () {
    // return the following step to be displayed
        if (this.animDirection === 'forward') {
            return this.currentStep < this.options.steps
                ? this.currentStep + 1
                : 1
        } else {
            return this.currentStep > 1
                ? this.currentStep - 1
                : this.options.steps
        }
    }

    _animate (timestamp) {
    // frame animation
        if (this.initiated) {
            if (this.animTime === undefined) {
                this.animTime = timestamp
            }

            let seg = Math.floor((timestamp - this.animTime) / (1000 / this.currentFps))
            let pauseAnim = false

            if (seg > this.animFrame) {
                this.animFrame = seg
                let fromStep = this.currentStep
                this.currentStep = this._targetStep()

                let continueAnimate = true
                if (this.currentStep === this.stopAtStep) {
                    this.currentLoop ++
                    if (this.currentLoop === this.stopAtLoop) {
                        continueAnimate = false
                    }
                }

                if (continueAnimate) {
                    this._draw()
                    this.emitter.emit('change', fromStep, this.currentStep)
                } else {
                    this._draw()
                    this.pause()
                    pauseAnim = true
                }
            }

            if (!pauseAnim && !this.requireStop) {
                this.anim = window.requestAnimationFrame((timestamp) => this._animate(timestamp))
            }
        }
    }

    _startAnimation () {
    // start animation
        if (!this.anim) {
            this.requireStop = false
            this.animTime = undefined
            this.animFrame = 0
            this.currentLoop = 0
            this.anim = window.requestAnimationFrame((timestamp) => this._animate(timestamp))
        } else {
            this.pause()
            this.play(this.animDirection)
        }
    }

    _pauseAnimation () {
    // pause animation
        if (this.anim) {
            this._resetUntil()
            this.requireStop = true
            window.cancelAnimationFrame(this.anim)
            this.anim = false
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
        return canvas.toDataURL && canvas.toDataURL('image/webp') && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    }

    _getExtension (filename) {
    // return the filename extension
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

        if (this.pic.objectFit === 'cover') {
            if (this.stepRatio >= this.parentRatio) {
                this.canvasHeight = this.parentHeight
                this.canvasWidth = (this.stepWidth * this.canvasHeight) / this.stepHeight
            } else {
                this.canvasWidth = this.parentWidth
                this.canvasHeight = (this.stepHeight * this.canvasWidth) / this.stepWidth
            }
        } else {
            if (this.stepRatio >= this.parentRatio) {
                this.canvasWidth = this.parentWidth
                this.canvasHeight = (this.stepHeight * this.canvasWidth) / this.stepWidth
            } else {
                this.canvasHeight = this.parentHeight
                this.canvasWidth = (this.stepWidth * this.canvasHeight) / this.stepHeight
            }
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
            if (!this.pic.width) this.pic.width = this.picture.naturalWidth
            if (!this.pic.height) this.pic.height = this.picture.naturalHeight

            if (!this.loaded) {
                this.emitter.emit('load', this.pic)
                this.loaded = true
            }
            this._draw()
        }
        this.picture.src = this._selectPicture()
    }

    _draw () {
    // draw sprite
        if (this.initiated) {
            this._setDimensions()
            this._drawPicture()
        }
    }

    _drawPicture () {
    // draw picture into canvas
        let targetColumn = Math.floor((this.currentStep - 1) % this.columns)
        let targetRow = Math.floor((this.currentStep - 1) / this.columns)

        let posX = targetColumn * this.stepWidth
        let posY = targetRow * this.stepHeight

        if (!this.options.testunit) {
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

            this.ctx.drawImage(
                this.picture,
                Math.round(posX), Math.round(posY),
                this.stepWidth,
                this.stepHeight,
                0, 0,
                this.canvasWidth,
                this.canvasHeight
            )
        }
    }

    _createCanvas () {
    // create html5 canvas
        this.canvas = document.createElement('canvas')
        this.canvas.setAttribute('style', 'position:absolute;left:50%;top:50%;-webkit-transform:translateY(-50%) translateY(1px) translateX(-50%) translateX(1px);-ms-transform:translateY(-50%) translateY(1px) translateX(-50%) translateX(1px);transform:translateY(-50%) translateY(1px) translateX(-50%) translateX(1px);')

        this.container = document.createElement('div')
        this.container.setAttribute('style', 'width:100%;height:100%;position:relative;')
        this.container.appendChild(this.canvas)

        this.selector.appendChild(this.container)
        this.ctx = this.canvas.getContext('2d')
    }

}

export default (...args) => { return new Spritz(...args) }
