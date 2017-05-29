import { strictEqual } from 'assert'
import Spritz from '../'
import jsdom from 'jsdom-global'


before(() => { jsdom() })
after(() => { jsdom() })


describe('Spritz.js', () => {


    // Create DOM
    let dom = [ { node: document.createElement('div'), class: 'sprite' } ]
    dom.forEach((el) => {
        document.body.appendChild(el.node)
        if (el.id) el.node.id = el.id
        if (el.class) el.node.classList.add(el.class)
    })


    // Create sprite
    const sprite = Spritz({
        picture: [
            {
                srcset: 'spritesheets/multisrc/graham-hd.png',
                media: '(min-width: 1200px)',
                width: 7800, height: 2829
            },
            {
                srcset: 'spritesheets/multisrc/graham.webp',
                width: 3900, height: 1415
            },
            {
                srcset: 'spritesheets/multisrc/graham.png',
                width: 3900, height: 1415
            }
        ],
        steps: 18,
        rows: 3
    })


    // Core
    describe('Core', () => {

        /* it('listen("click", "#id", () => {}) should add 1 eventListener', () => {
            eventt.listen('click', '#id', () => t++)
            strictEqual(eventt.events.length, 1)
        }) */

    })


    // PictureElem
    describe('PictureElem', () => {

        /* it('listen("click", "#id", () => {}) should add 1 eventListener', () => {
            eventt.listen('click', '#id', () => t++)
            strictEqual(eventt.events.length, 1)
        }) */

    })


    // API
    describe('API', () => {

        /* it('listen("click", "#id", () => {}) should add 1 eventListener', () => {
            eventt.listen('click', '#id', () => t++)
            strictEqual(eventt.events.length, 1)
        }) */

    })


    // Events
    describe('Events', () => {

        /* it('listen("click", "#id", () => {}) should add 1 eventListener', () => {
            eventt.listen('click', '#id', () => t++)
            strictEqual(eventt.events.length, 1)
        }) */

    })


})
