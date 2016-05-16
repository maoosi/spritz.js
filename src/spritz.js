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
        proxy: options.proxy || false
    }


    /**
    * Useful constants
    */

    // const windowsHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    const uniqid = shortid.generate()


    /**
    * Local variables
    */

    let imageNode = null
    let styleNode = null
    let htmlNode = null
    let svgNode = null
    let proxyNode = null
    let proxyImagesList = []
    let proxyTimeout = null
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

    const __build = [
        _calculations,
        _generateDOM,
        _generateMask,
        _generateCSS,
        _defaultStep
    ]

    const __init = [
        load,
        build
    ]


    /**
    * Expose public methods
    * https://github.com/callmecavs/knot.js
    */

    const instance = knot({
        init: init,
        load: load,
        build: build,
        destroy: destroy,
        getStep: getStep,
        setStep: setStep,
        goToStep: goToStep,
        isMaskingSupported: isMaskingSupported,
        setProgress: setProgress
    })

    return instance


    /**
    * Private methods
    */

    // Run a serie of functions
    function _runSeries (functions) {
        return new Promise(function (resolve, reject) {
            resolve(functions.forEach(func => func()))
        })
    }

    // Sprite calculations
    function _calculations () {
        // how many columns ?
        sprite.columns = Math.ceil(settings.steps / settings.rows)

        // what's background sizes
        backgroundSize = 100 * sprite.columns

        // fixed width calculation
        sprite.width = settings.width / sprite.columns
        sprite.width = (Math.round((sprite.width * 1000) / 10) / 100).toFixed(2)

        // fixed height calculation
        sprite.height = settings.height / settings.rows
        sprite.height = (Math.round((sprite.height * 1000) / 10) / 100).toFixed(2)

        // sprite padding used for responsive
        sprite.padding = ((sprite.height * 100) * 100 / (sprite.width * 100))
    }

    // Generate the DOM
    function _generateDOM () {
        if (htmlNode === null) {
            htmlNode = document.createElement('div')
            document
                .querySelector(settings.container)
                .appendChild(htmlNode)
                .setAttribute('id', 'spritz-' + uniqid + '')
        }
    }

    // Generate the JPG/PNG mask using SVG
    function _generateMask () {
        if (_canUseSVG() && settings.mask !== false && svgNode === null) {
            let svgMask =
            `
            <svg id="spritz-svg-${uniqid}" preserveAspectRatio="xMinYMin" width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${sprite.width} ${sprite.height}">
                <defs>
                    <mask id="spritzTopMask">
                        <image width="${settings.width}" height="${settings.height}" xlink:href="${settings.mask}"></image>
                    </mask>
                </defs>
                <image mask="url(#spritzTopMask)" id="spritzTop" width="${settings.width}" height="${settings.height}" xlink:href="${settings.src}"></image>
            </svg>
            `

            document
                .querySelector('#spritz-' + uniqid + '')
                .innerHTML = svgMask

            svgNode = document.querySelector('#spritz-svg-' + uniqid + '')
        }
    }

    // Return true if SVG Mask can be used by the browser
    function _canUseSVG () {
        // Return true if SVG support enabled (work for IE8+)
        return !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect)
    }

    // Set default step
    function _defaultStep () {
        setStep(settings.initial)
    }

    // Generate the CSS
    function _generateCSS () {
        if (styleNode === null && imageNode != null) {
            let spriteBehavior = ''
            let spriteFallback = ''
            let css = ''

            // if responsive option, width = 100% & height = proportional
            if (settings.responsive === true) {
                spriteBehavior +=
                `
                position: relative;
                width: 100%;
                `
                css +=
                `
                #spritz-${uniqid}::after {
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
                -webkit-transform: scaleX(-1);
                -moz-transform: scaleX(-1);
                -ms-transform: scaleX(-1);
                -o-transform: scaleX(-1);
                transform: scaleX(-1);
                filter: FlipH;
                -ms-filter: 'FlipH';
                `
            }

            // if SVG is not supported we display the CSS background fallback
            if (svgNode === null) {
                spriteFallback +=
                `
                background: url('${imageNode.src}') no-repeat 0 0%;
                background-size: ${backgroundSize}%;
                background-position: 0 0;
                `
            }

            // if there is proxy images
            if (settings.proxy !== false) {
                css +=
                `
                #spritz-proxy-${uniqid} {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    background-repeat: no-repeat;
                    background-size: 100%;
                    background-position: 0 0;
                }

                #spritz-${uniqid}.proxy-visible #spritz-svg-${uniqid} {
                    transition: opacity 0s linear .4s;
                    opacity: 0;
                }

                #spritz-${uniqid}.proxy-visible #spritz-proxy-${uniqid} {
                    transition: opacity .4s linear;
                    opacity: 1;
                }
                `
            }

            // generate the css
            css +=
            `
            #spritz-${uniqid} {
                left: 50%;
                top: 50%;
                -webkit-transform: translate(-50%, -50%);
                -moz-transform: translate(-50%, -50%);
                -ms-transform: translate(-50%, -50%);
                -o-transform: translate(-50%, -50%);
                transform: translate(-50%, -50%);
                overflow: hidden;
                ${spriteFallback}
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

    // Load and cache the
    function _loadProxyImage (source) {
        return new Promise(function (resolve, reject) {
            if (typeof proxyImagesList[source] === 'undefined') {
                let proxyImage = new Image()
                proxyImage.onload = function () {
                    proxyImagesList[source] = proxyImage
                    resolve(proxyImagesList[source])
                }
                proxyImage.src = source
            } else {
                resolve(proxyImagesList[source])
            }
        })
    }

    // Return the following step
    function _nextStep () {
        return currentStep < settings.steps ? currentStep + 1 : 1
    }

    // Return the previous step
    function _prevStep () {
        return currentStep > 1 ? currentStep - 1 : settings.steps
    }

    // Replace the current step by it's HD replacement, only if it exists
    function _proxy (step) {
        // Check if the proxy frame has been set by the user
        if (typeof settings.proxy[step] === 'undefined') {
            return
        }

        // If the proxy dom element doesn't exist, we create it !
        if (proxyNode === null) {
            proxyNode = document.createElement('div')
            htmlNode
                .appendChild(proxyNode)
                .setAttribute('id', 'spritz-proxy-' + uniqid + '')
        }

        // If the proxy dom element, we can load the proxy image
        if (proxyNode !== null) {
            let proxySrc = settings.proxy[step]
            _loadProxyImage(proxySrc).then(function (proxyImage) {
                proxyNode.style.backgroundImage = 'url("' + proxyImage.getAttribute('src') + '")'
                htmlNode.classList.add('proxy-visible')
            })
        }
    }


    /**
    * Public methods
    */

    // Initiate the instance
    function init (initial = null) {
        if (initial !== null) settings.initial = initial
        _runSeries(__init).then(function () {
            return instance.emit('init')
        })
    }

    // Create the sprite structure
    function build () {
        _runSeries(__build).then(function () {
            return instance.emit('build')
        })
    }

    // Destroy completely the sprite and restore initial state
    function destroy () {
        styleNode.parentNode.removeChild(styleNode)
        htmlNode.parentNode.removeChild(htmlNode)

        imageNode = styleNode = htmlNode = svgNode = proxyNode = proxyTimeout = null
        proxyImagesList = []

        return instance.emit('destroy')
    }

    // Load the sprite image
    function load () {
        if (imageNode === null) {
            imageNode = new Image()
            imageNode.onload = function () {
                return instance.emit('load')
            }
            imageNode.src = settings.src
        }
    }

    // Return true if SVG Masking is supported
    function isMaskingSupported () {
        return _canUseSVG
    }

    // Return the current frame/step
    function getStep () {
        return currentStep
    }

    // Change the current frame/step (no animation)
    function setStep (step = 1) {
        if (styleNode != null && htmlNode != null && imageNode != null) {
            // If next step
            if (step === 'next') {
                step = _nextStep()
            }

            // If prev step
            if (step === 'prev') {
                step = _prevStep()
            }

            // Hide the proxy
            htmlNode.classList.remove('proxy-visible')

            // Step & rows values, starting from 0
            let stepZero = step - 1
            let rowsZero = settings.rows - 1
            let columnsZero = sprite.columns - 1

            // Calculate the new position
            let positionX = (100 / columnsZero) * (stepZero % sprite.columns)
            let positionY = (100 / rowsZero) * Math.floor(stepZero / sprite.columns)

            // Set the new sprite position
            if (svgNode !== null) {
                positionX = (positionX * columnsZero / 100) * sprite.width
                positionY = (positionY * rowsZero / 100) * sprite.height
                svgNode.setAttribute('viewBox', '' + positionX + ' ' + positionY + ' ' + sprite.width + ' ' + sprite.height + ' ')
            } else {
                htmlNode.style.backgroundPosition = '' + positionX + '% ' + positionY + '%'
            }

            // Save current step
            currentStep = step

            // Fire proxy replacement after a certain time on a frame
            clearTimeout(proxyTimeout)
            proxyTimeout = setTimeout(function () {
                _proxy(step)
            }, 500)

            // Emit changed
            return instance.emit('change')
        }
    }

    // Set a progress value: 0 = first step / 1 = last step
    function setProgress (progressValue) {
        let stepEquiv = Math.round(progressValue * 100 * settings.steps / 100)
        if (stepEquiv === 0) stepEquiv++
        return setStep(stepEquiv)
    }

    // Update current frame/step (animated)
    function goToStep (step, fps = 12, easing = 'ease') {
        // TODO
    }
}
