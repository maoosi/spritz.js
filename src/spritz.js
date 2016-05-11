import knot from 'knot.js'
import shortid from 'shortid'


export default (options = {}) => {

    /**
    * Default settings
    */

    const settings = {
        container: options.container || 'body',

        steps: options.steps,
        initial: options.initial || 1,

        rows: options.rows || 1,
        width: options.width,
        height: options.height,
        flip: options.flip || false,
        responsive: options.responsive || false,

        src: options.src,
        mask: options.mask || false,
        proxy: options.proxy || {}
    }


    /**
    * Useful constants
    */

    const windowsHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    const uniqid = shortid.generate()


    /**
    * Local variables
    */

    let imageNode = null
    let styleNode = null
    let htmlNode  = null
    let backgroundSize = null
    let sprite = {
        columns: null,
        padding: null,
        width: null,
        height: null
    }
    let currentStep = null


    /**
    * Series of functions
    */

    const __create = [
        _calculations,
        _generateDOM,
        _generateCSS,
        _defaultStep
    ]

    const __init = [
        load,
        create
    ]


    /**
    * Expose public methods
    * https://github.com/callmecavs/knot.js
    */

    const instance = knot({
        init: init,
        load: load,
        create: create,
        destroy: destroy,
        getStep: getStep,
        setStep: setStep,
        goToStep: goToStep,
        prevStep: prevStep,
        nextStep: nextStep
    })

    return instance


    /**
    * Private methods
    */

    // Run a serie of functions
    function _runSeries(functions) {
        return new Promise(function(resolve, reject) {
            resolve( functions.forEach(func => func()) )
        })
    }

    // Sprite calculations
    function _calculations() {

        // how many columns ?
        sprite.columns = Math.ceil(settings.steps / settings.rows)

        // what's background sizes
        backgroundSize = 100 * sprite.columns

        // fixed width calculation
        sprite.width = settings.width / sprite.columns
        sprite.width = (Math.round((sprite.width * 1000)/10)/100).toFixed(2)

        // fixed height calculation
        sprite.height = settings.height / settings.rows
        sprite.height = (Math.round((sprite.height * 1000)/10)/100).toFixed(2)

        // sprite padding used for responsive
        sprite.padding = ((sprite.height*100) * 100 / (sprite.width*100))

    }

    // Generate the DOM
    function _generateDOM() {
        if (htmlNode === null) {
            htmlNode = document.createElement('div')
            document
            .querySelector(settings.container)
            .appendChild(htmlNode)
            .setAttribute('id', 'sprite-'+ uniqid +'')
        }
    }

    // Set default step
    function _defaultStep() {
        if (settings.initial > 1) {
            setStep(settings.initial)
        }
    }

    // Generate the CSS
    function _generateCSS() {
        if (styleNode === null && imageNode != null) {

            let spriteBehavior = ``
            let css = ``

            // if responsive option, width = 100% & height = proportional
            if (settings.responsive === true) {
                spriteBehavior +=
                `
                position: relative;
                width: 100%;
                `
                css +=
                `
                #sprite-${uniqid}::after {
                    content: '';
                    display: block;
                    padding-bottom: ${sprite.padding}%;
                }
                `
                // fixed sizes
            } else {
                spriteBehavior +=
                `
                position: absolute;
                width: ${sprite.width}px;
                height: ${sprite.height}px;
                `
            }

            // If flip sprite
            if (settings.flip === true) {
                spriteBehavior +=
                `
                -moz-transform: scaleX(-1);
                -o-transform: scaleX(-1);
                -webkit-transform: scaleX(-1);
                transform: scaleX(-1);
                filter: FlipH;
                -ms-filter: 'FlipH';
                `
            }

            // generate the css
            css +=
            `
            #sprite-${uniqid} {
                left: 0; right: 0;
                top: 0; bottom: 0;
                background: url('${imageNode.src}') no-repeat 0 0%;
                background-size: ${backgroundSize}%;
                background-position: 0 0;
                ${spriteBehavior}
            }
            `

            // create style node
            styleNode = document.createElement('style')
            styleNode.innerHTML = css
            styleNode.appendChild(document.createTextNode('')) // WebKit hack

            // append style element to the head
            document.head.appendChild(styleNode)

        }
    }


    /**
    * Public methods
    */

    // Init the instance
    function init() {
        _runSeries(__init).then(function() {
            return instance.emit('init')
        })
    }

    // Create the sprite structure
    function create() {
        _runSeries(__create).then(function() {
            return instance.emit('create')
        })
    }

    // Destroy completely the sprite and restore initial state
    function destroy() {
        styleNode.parentNode.removeChild(styleNode)
        htmlNode.parentNode.removeChild(htmlNode)
        imageNode = htmlNode = styleNode = null
        return instance.emit('destroy')
    }

    // Load the sprite image
    function load() {
        if (imageNode === null) {
            imageNode = new Image()
            imageNode.onload = function() {
                return instance.emit('load')
            }
            imageNode.src = settings.src
        }
    }

    // Return the current frame/step
    function getStep() {
        return currentStep
    }

    // Change the current frame/step (no animation)
    function setStep(step = 1) {
        if (styleNode != null && htmlNode != null && imageNode != null) {

            // Step & rows values, starting from 0
            let stepZero = step - 1
            let rowsZero = settings.rows - 1
            let columnsZero = sprite.columns - 1

            // Calculate the new position
            let positionX = (100 / columnsZero) * (stepZero % sprite.columns)
            let positionY = (100 / rowsZero ) * Math.floor( stepZero / sprite.columns )

            // Apply position with css
            htmlNode.style.backgroundPosition = ''+ positionX +'% '+ positionY +'%'

            // Save step
            currentStep = step

            // Emit changed
            return instance.emit('change')

        }
    }

    // Go to the next step
    function nextStep() {
        let nextStep = currentStep < settings.steps ? currentStep + 1 : 1
        return setStep(nextStep)
    }

    // Go to the previous step
    function prevStep() {
        let prevStep = currentStep > 1 ? currentStep - 1 : settings.step
        return setStep(prevStep)
    }

    // Set a progress value: 0 = first step / 1 = last step
    function setProgress(progress) {
        // TODO
    }

    // Update current frame/step (animated)
    function goToStep(step, fps = 12) {
        // TODO
    }

}
