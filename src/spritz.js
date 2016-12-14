import knot from 'knot.js'

export default class Spritz {

    /**
        --- CORE ---
    **/

    constructor (selector, options = {}) {
    // instance constructor
        this.options = {

        }

        this.selector = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector

        this.emitter = knot()

        this.initiated = false

        return this
    }

    _globalVars () {
    // global vars
        this.canvas = false
        this.ctx = false
        this.parentWidth = this.selector.clientWidth
        this.parentHeight = this.selector.clientHeight

        this.waitQueue = []
        this.waitTimer = false
        this.waitExecution = false
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
        this.parentWidth = this.selector.clientWidth
        this.parentHeight = this.selector.clientHeight
        this.canvas.setAttribute('width', this.parentWidth)
        this.canvas.setAttribute('height', this.parentHeight)
        this.ctx = this.canvas.getContext('2d')

        this.emitter.emit('resize')
    }

    /**
        --- API ---
    **/

    init () {
    // init vars, canvas, and snake
        if (!this.initiated) {
            this._globalVars()
            this._bindEvents()

            this.initiated = true
            this.emitter.emit('init')
        }

        return this
    }

    destroy () {
    // destroy snake & instance
        return this._handleWait(() => {
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
                this.emitter.off('playback')
                this.emitter.off('wait')
                this.emitter.off('pause')
                this.emitter.off('stop')
            }
        })
    }

    play (fps) {
    // play animation
        return this._handleWait(() => {
            this._playAnimation()

            console.log('playing')

            this.emitter.emit('play')
        })
    }

    playback (fps) {
    // play animation
        return this._handleWait(() => {
            this._playAnimation()

            console.log('playing backwards')

            this.emitter.emit('playback')
        })
    }

    pause (silent = false) {
    // stop animation
        return this._handleWait(() => {
            this._pauseAnimation()

            if (!silent) {
                console.log('paused')
                this.emitter.emit('pause')
            }
        })
    }

    stop () {
    // stop animation
        return this._handleWait(() => {
            this.pause(true)
            this._resetAnimation()

            console.log('stopped')

            this.emitter.emit('stop')
        })
    }

    wait (milliseconds) {
    // chainable timeout
        return this._handleWait(() => {
            this.emitter.emit('wait')
            console.log('waiting for ' + milliseconds + 'ms')
        }, milliseconds)
    }

    on (...args) { return this.emitter.on(...args) }
    off (...args) { return this.emitter.off(...args) }
    once (...args) { return this.emitter.once(...args) }

    /**
        --- WAIT ---
    **/

    _handleWait (func, milliseconds = false) {
        this.waitQueue.push({
            'func': func,
            'timeout': milliseconds
        })
        return this.waitExecution ? this : this._processNext()
    }

    _processNext () {
        if (this.waitQueue.length > 0) {
            let current = this.waitQueue.shift()
            let f = current['func']
            let t = current['timeout']

            if (t !== false) {
                f()
                this.waitExecution = true
                this.waitTimer = setTimeout(() => {
                    this._processNext()
                }, t)
            } else {
                this.waitExecution = false
                f()
                this._processNext()
            }
        }

        return this
    }

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
        --- DETECT ---
    **/

    // ->

    /**
        --- DRAW ---
    **/

    // ->

}
