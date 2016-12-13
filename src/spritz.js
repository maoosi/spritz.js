import knot from 'knot.js'

export default class Spritz {

    /**
        --- CORE ---
    **/

    constructor (selector, options = {}) {
    // instance constructor
        this.options = {
            thickness: options.thickness || 22,
            color: options.color || 'red',
            length: options.length || 10,
            speed: options.speed || 15
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
        this.snake = []
        this.parentWidth = this.selector.clientWidth
        this.parentHeight = this.selector.clientHeight
        this.direction = 'right'
        this.directionQueue = this.direction
        this.anim = false
        this.starter = false
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
        this._drawSnake()

        this.emitter.emit('resize')
    }

    /**
        --- API ---
    **/

    init () {
    // init vars, canvas, and snake
        if (!this.initiated) {
            this._globalVars()
            this._createCanvas()
            this._createSnake()
            this._drawSnake()
            this._bindEvents()

            this.initiated = true
            this.emitter.emit('init')
        }

        return this
    }

    destroy () {
    // destroy snake & instance
        if (this.initiated) {
            this.stop()
            this._unbindEvents()
            this.canvas.parentNode.removeChild(this.canvas)
            this.canvas = false
            this.ctx = false
            this.snake = []

            this.initiated = false
            this.emitter.emit('destroy')

            this.emitter.off('init')
            this.emitter.off('destroy')
            this.emitter.off('reset')
            this.emitter.off('play')
            this.emitter.off('pause')
            this.emitter.off('stop')
            this.emitter.off('resize')
            this.emitter.off('draw')
        }

        return this
    }

    play () {
    // play animation
        this._playAnimation()

        this.emitter.emit('play')

        return this
    }

    pause () {
    // stop animation
        this._pauseAnimation()

        this.emitter.emit('pause')

        return this
    }

    stop () {
    // stop animation
        this.pause()
        this.reset()

        this.emitter.emit('stop')

        return this
    }

    on (...args) { return this.emitter.on(...args) }
    off (...args) { return this.emitter.off(...args) }
    once (...args) { return this.emitter.once(...args) }

    /**
        --- ANIMATE ---
    **/

    _playAnimation () {
    // start snake animation
        this.anim = window.requestAnimationFrame((timestamp) => {
            this._animStep(timestamp)
        })
    }

    _pauseAnimation () {
    // pause snake animation
        if (this.anim) {
            window.cancelAnimationFrame(this.anim)
            this.anim = false
            this.starter = false
        }
    }

    /**
        --- DETECT ---
    **/

    //->

    /**
        --- DRAW ---
    **/

    //->

}
