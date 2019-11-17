const Spritz = require('../')

/* ===============
  POLYFILLS
=============== */

const TEST_IMG = 'spritesheets/multisrc/graham.png'

require('raf').polyfill()

window.matchMedia = () => {
    return {
        matches : false,
        addListener : () => {},
        removeListener: () => {}
    }
}

Object.defineProperty(global.Image.prototype, 'src', {
    set(src) {
        if (src === TEST_IMG) {
            setTimeout(() => this.onload())
        }
    }
})

/* ===============
  FUNCTIONS
=============== */

var sprite = null
var spriteNode = null
var spriteImg = TEST_IMG

const init = (options) => {
    spriteNode = document.createElement('div')
    document.body.appendChild(spriteNode)

    sprite = Spritz(spriteNode, Object.assign({
        picture: [
            {
                srcset: spriteImg,
                width: 3900, height: 1415
            }
        ],
        steps: 18,
        rows: 3,
        init: false,
        testunit: true
    }, options))
}

const destroy = () => {
    sprite.destroy()
    spriteNode.parentNode.removeChild(spriteNode)

    sprite = null
    spriteNode = null
}

/* ===============
  HOOKS
=============== */

beforeEach(() => { init() })
afterEach(() => { destroy() })

/* ===============
  CORE TESTS
=============== */

describe('Core', () => {

    test('By default, the sprite should load automatically', () => {
        destroy()
        init({ init: true })
        expect(spriteNode.innerHTML).not.toBe('')
    })

    test('With `init: false`, the sprite shouldn\'t load automatically', () => {
        expect(spriteNode.innerHTML).toBe('')
    })

})

/* ===============
  API BASIC TESTS
=============== */

describe('API basic', () => {

    test('`.fps(12)` should change the FPS value to 12', () => {
        sprite.init().fps(12)
        expect(sprite.currentFps).toBe(12)
    })

    test('`.play()` should play the sprite', done => {
        setTimeout(() => {
            expect(sprite.currentStep > 1).toBe(true)
            done()
        }, 100)

        sprite.init().play()
    })

    test('`.play("backward")` should play the sprite backwards', done => {
        setTimeout(() => {
            expect(sprite.currentStep < 18).toBe(true)
            done()
        }, 200)

        sprite.init(18).play('backward')
    })

    test('`.playback()` should play the sprite backwards', done => {
        setTimeout(() => {
            expect(sprite.currentStep < 18).toBe(true)
            done()
        }, 200)

        sprite.init(18).playback()
    })

    test('`.pause()` should pause the sprite animation', done => {
        setTimeout(() => {
            sprite.pause()
            let isAnimStopped = sprite.anim === false
            expect(isAnimStopped).toBe(true)
            done()
        }, 100)

        sprite.init().play()
    })

    test('`.stop()` should stop the sprite animation', done => {
        setTimeout(() => {
            sprite.stop()
            let isAnimStopped = sprite.anim === false
            expect(isAnimStopped).toBe(true)
            done()
        }, 100)

        sprite.init().play()
    })

    test('`.wait(500)` should delay the following execution by 0.5 sec', done => {
        setTimeout(() => {
            let isAnimStopped = sprite.anim === false
            expect(isAnimStopped).toBe(false)
            done()
        }, 300)

        sprite.init().play().wait(500).pause()
    })

    test('`.step(3)` should change the current step', () => {
        sprite.init().step(5)
        expect(sprite.currentStep).toBe(5)
    })

    test('`.next()` should go to the next step', () => {
        sprite.init(3).next()
        expect(sprite.currentStep).toBe(4)
    })

    test('`.prev()` should go to the previous step', () => {
        sprite.init(3).prev()
        expect(sprite.currentStep).toBe(2)
    })

})

/* ===============
  API ADVANCED TESTS
=============== */

describe('API advanced', () => {

    test('`.init()` should init the sprite', () => {
        sprite.init()
        expect(sprite.initiated).toBe(true)
    })

    test('`.init()` should display the sprite into the browser', () => {
        sprite.init()
        expect(spriteNode.innerHTML).not.toBe('')
    })

    test('`.init(3)` should display the sprite at step 3', () => {
        sprite.init(3)
        expect(sprite.currentStep).toBe(3)
    })


    test('`.destroy()` should destroy the sprite', done => {
        setTimeout(() => {
            expect(spriteNode.innerHTML).toBe('')
            done()
        }, 100)

        sprite.init().destroy()
    })

    test('`.until(3, 2)` should stop next animation at step/frame 3', done => {
        setTimeout(() => {
            let isAnimStopped = sprite.anim === false
            expect(isAnimStopped).toBe(false)
            done()
        }, 500)

        sprite.init().fps(25).until(3, 2).play()
    })

    test('`.get("step")` should return the current step', () => {
        sprite.init(5).get('step', s => expect(s).toBe(5))
    })

    test('`.get("picture")` should return the current picture', () => {
        sprite.init().get('picture', p => {
            expect(p.srcset).toBe(spriteImg)
        })
    })

})

/* ===============
  EVENTS TESTS
=============== */

describe('Events', () => {

    test('`.on("ready")` should be called when sprite is ready', done => {
        setTimeout(() => {
            expect(cb).toBe(true)
            done()
        }, 200)

        let cb = false
        sprite.on('ready', () => { cb = true })
        sprite.init()
    })

    test('`.on("load")` should be called when sprite image has been loaded', done => {
        setTimeout(() => {
            expect(cb).toBe(true)
            done()
        }, 200)

        let cb = false
        sprite.on('load', () => { cb = true })
        sprite.init()
    })

    test('`.on("load")` callback should pass `picture` as parameter', done => {
        setTimeout(() => {
            expect(pic.srcset).toBe(spriteImg)
            done()
        }, 200)

        let pic = false
        sprite.on('load', (p) => { pic = p })
        sprite.init()
    })

    test('`.on("destroy")` should be called when sprite has been destroyed', done => {
        setTimeout(() => {
            expect(cb).toBe(true)
            done()
        }, 200)

        let cb = false
        sprite.on('destroy', () => { cb = true })
        sprite.init().destroy()
    })

    test('`.on("play")` should be called when animation start playing', done => {
        setTimeout(() => {
            expect(cb).toBe(true)
            done()
        }, 200)

        let cb = false
        sprite.on('play', () => { cb = true })
        sprite.init().play()
    })

    test('`.on("play")` callback should pass `direction` as parameter', done => {
        setTimeout(() => {
            expect(dir).toBe('forward')
            done()
        }, 200)

        let dir = false
        sprite.on('play', (d) => { dir = d })
        sprite.init().play()
    })

    test('`.on("pause")` should be called when animation pause playing', done => {
        setTimeout(() => {
            expect(cb).toBe(true)
            done()
        }, 200)

        let cb = false
        sprite.on('pause', () => { cb = true })
        sprite.init().play().pause()
    })

    test('`.on("stop")` should be called when animation stop playing', done => {
        setTimeout(() => {
            expect(cb).toBe(true)
            done()
        }, 200)

        let cb = false
        sprite.on('stop', () => { cb = true })
        sprite.init().play().stop()
    })

    test('`.on("wait")` should be called when a delay timeout is called', done => {
        setTimeout(() => {
            expect(cb).toBe(true)
            done()
        }, 200)

        let cb = false
        sprite.on('wait', () => { cb = true })
        sprite.init().play().wait(200).stop()
    })

    test('`.on("wait")` callback should pass `delay` as parameter', done => {
        setTimeout(() => {
            expect(delay).toBe(200)
            done()
        }, 200)

        let delay = false
        sprite.on('wait', (d) => { delay = d })
        sprite.init().play().wait(200).stop()
    })

    test('`.on("change")` should be called when a step is manually changed', done => {
        setTimeout(() => {
            expect(cb).toBe(true)
            done()
        }, 200)

        let cb = false
        sprite.on('change', () => { cb = true })
        sprite.init().next()
    })

    test('`.on("change")` callback should pass `from` and `to` as parameters', done => {
        setTimeout(() => {
            expect(from === 1 && to === 2).toBe(true)
            done()
        }, 200)

        let from = false
        let to = false
        sprite.on('change', (f, t) => {
            from = f
            to = t
        })
        sprite.init().next()
    })

})
