import 'classlist.js' // Cross-browser element.classList - https://github.com/eligrey/classList.js/
import knot from 'knot.js' // A browser-based event emitter - https://github.com/callmecavs/knot.js
import shortid from 'shortid' // Short id generator - https://github.com/dylang/shortid
import debounce from 'lodash.debounce' // Debounce function - https://lodash.com/docs#debounce

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
        breakpoint: options.breakpoint || 640,

        src: options.src,
        mask: options.mask || false,
        proxy: options.proxy || false,

        ariaLabel: options.ariaLabel || 'Sprite image used for presentation purpose'
    }


    /**
    * Useful constants
    */

    const uniqid = shortid.generate()


    /**
    * Local variables
    */

    let imageNode = null
    let styleNode = null
    let htmlNode = null
    let svgNode = null
    let proxyNode = null
    let bgNode = null

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
        _applySettingsClasses,
        _generateAccessibility,
        _bindEvents,
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
        changeStep: changeStep,
        changeProgress: changeProgress,
        animateStep: animateStep,
        getCurrentStep: getCurrentStep,
        isMaskingSupported: isMaskingSupported,
        flip: flip
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
            bgNode = document.createElement('div')

            bgNode.setAttribute('id', 'spritz-bg-' + uniqid + '')
            htmlNode.setAttribute('id', 'spritz-' + uniqid + '')

            if (typeof settings.container === 'object') {
                settings.container.appendChild(htmlNode)
            } else {
                document
                    .querySelector(settings.container)
                    .appendChild(htmlNode)
            }

            htmlNode.appendChild(bgNode)
        }
    }

    // Attach events listeners
    function _bindEvents () {
        window.addEventListener('resize', _viewportResize())
    }

    // Detach events listeners
    function _unbindEvents () {
        window.removeEventListener('resize', _viewportResize())
    }

    // Viewport resizing
    function _viewportResize () {
        return debounce(function (event) {
            settings.initial = currentStep
            build()
        }, 500)
    }

    // Generate accessibility tags
    function _generateAccessibility () {
        if (htmlNode !== null) {
            htmlNode.setAttribute('role', 'img')
            htmlNode.setAttribute('aria-label', settings.ariaLabel)
            htmlNode.setAttribute('tabindex', '0')
            htmlNode.setAttribute('aria-hidden', 'false')
        }
    }

    // Apply classes according user settings
    function _applySettingsClasses () {
        if (htmlNode !== null) {
            // Responsive
            if (settings.responsive === true) {
                htmlNode.classList.remove('rwd--false')
                htmlNode.classList.add('rwd--true')
            } else {
                htmlNode.classList.remove('rwd--true')
                htmlNode.classList.add('rwd--false')
            }

            // Flip
            if (settings.flip === true) {
                htmlNode.classList.remove('flip--false')
                htmlNode.classList.add('flip--true')
            } else {
                htmlNode.classList.remove('flip--true')
                htmlNode.classList.add('flip--false')
            }

            // No Svg support
            if (svgNode === null) {
                htmlNode.classList.remove('svg--true')
            } else {
                htmlNode.classList.add('svg--true')
            }
        }
    }

    // Generate the JPG/PNG mask using SVG
    function _generateMask () {
        if (_canUseSVG() && settings.mask !== false && svgNode === null) {
            let svgMask =
            `
            <svg id="spritz-svg-${uniqid}" preserveAspectRatio="xMinYMin" width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${sprite.width} ${sprite.height}">
                <title id="title-svg-${uniqid}">${settings.ariaTitle}</title>
                <desc id="desc-svg-${uniqid}">${settings.ariaDescription}</desc>
                <defs>
                    <mask id="spritzTopMask">
                        <image width="${settings.width}" height="${settings.height}" role="presentation" xlink:href="${settings.mask}"></image>
                    </mask>
                </defs>
                <image mask="url(#spritzTopMask)" id="spritzTop" role="presentation" width="${settings.width}" height="${settings.height}" xlink:href="${settings.src}"></image>
            </svg>
            `

            bgNode.insertAdjacentHTML('afterend', svgMask)
            svgNode = document.querySelector('#spritz-svg-' + uniqid + '')
        }
    }

    // Return true if SVG Mask can be used by the browser
    function _canUseSVG () {
        // SVG Masking disabled for Safari (http://stackoverflow.com/questions/31384271/safari-unreasonably-slow-rendering-svg-files)
        if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent) === true) {
            return false
        }

        // Return true if SVG support enabled (work for IE8+)
        return !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect)
    }

    // Set default step
    function _defaultStep () {
        changeStep(settings.initial)
    }

    // Generate the CSS
    function _generateCSS () {
        if (styleNode === null && imageNode != null) {
            let css =
            `
            /* == Sprite base css == */
            #spritz-${uniqid} {
                overflow: hidden;
                outline: 0;
            }
            #spritz-bg-${uniqid} {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: url('${imageNode.src}') no-repeat 0 0%;
                background-size: ${backgroundSize}%;
                background-position: 0 0;
            }

            /* == SVG Masking == */
            #spritz-svg-${uniqid} {
                position: absolute;
                top: 0;
                left: 0;
                opacity: 0;
            }
            #spritz-${uniqid}.svg--true #spritz-bg-${uniqid} {
                opacity: 0;
            }
            #spritz-${uniqid}.svg--true #spritz-svg-${uniqid} {
                opacity: 1;
            }

            /* == Responsive mode == */
            #spritz-${uniqid}.rwd--true {
                position: relative;
                width: 100%;
            }
            #spritz-${uniqid}.rwd--true::after {
                content: '';
                display: block;
                padding-bottom: ${sprite.padding}%;
            }

            /* == Non-responsive mode == */
            #spritz-${uniqid}.rwd--false {
                position: absolute;
                left: 50%;
                top: 50%;
                -webkit-transform: translate(-50%, -50%);
                -moz-transform: translate(-50%, -50%);
                -ms-transform: translate(-50%, -50%);
                -o-transform: translate(-50%, -50%);
                transform: translate(-50%, -50%);
                width: ${sprite.width}px;
                height: ${sprite.height}px;
            }

            /* == Proxy == */
            #spritz-proxy-${uniqid} {
                position: absolute;
                left: -9999px;
                top: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                background-repeat: no-repeat;
                background-size: 100%;
                background-position: 0 0;
            }
            #spritz-${uniqid}.proxy--visible #spritz-svg-${uniqid},
            #spritz-${uniqid}.proxy--visible #spritz-bg-${uniqid} {
                transition: opacity 0.6s linear 0.7s;
                opacity: 0;
            }
            #spritz-${uniqid}.proxy--visible #spritz-proxy-${uniqid} {
                transition: opacity 0.6s linear 0.1s;
                opacity: 1;
                left: 0;
            }

            /* == Flip == */
            #spritz-${uniqid}.flip--true #spritz-proxy-${uniqid},
            #spritz-${uniqid}.flip--true #spritz-bg-${uniqid},
            #spritz-${uniqid}.flip--true #spritz-svg-${uniqid} {
                -webkit-transform: scaleX(-1);
                -moz-transform: scaleX(-1);
                -ms-transform: scaleX(-1);
                -o-transform: scaleX(-1);
                transform: scaleX(-1);
                filter: fliph();
                -ms-filter: 'FlipH';
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

    // Load and cache the proxy image
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
        // Check if the proxy frame has been defined by the user
        if (typeof settings.proxy[step] === 'undefined') {
            return
        }

        // Disable for mobile devices
        let viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
        if (settings.breakpoint !== false && viewportWidth < settings.breakpoint) {
            return
        }

        // If the proxy dom element doesn't exist, we create it !
        if (proxyNode === null) {
            proxyNode = document.createElement('div')
            htmlNode
                .appendChild(proxyNode)
                .setAttribute('id', 'spritz-proxy-' + uniqid + '')
        }

        // If the proxy dom element exists, we can load the proxy image
        if (proxyNode !== null) {
            let proxySrc = settings.proxy[step]
            _loadProxyImage(proxySrc).then(function (proxyImage) {
                proxyNode.style.backgroundImage = 'url("' + proxyImage.getAttribute('src') + '")'
                proxyNode.style.left = '-9999px'

                htmlNode.classList.add('proxy--visible')

                // IE Fix for rendering
                setTimeout(function () {
                    proxyNode.style.left = '0'
                }, 100)
            })
        }
    }


    /**
    * Public methods
    */

    // Initiate the instance
    function init (initial = null) {
        if (initial !== null) settings.initial = initial
        return _runSeries(__init).then(function () {
            return instance.emit('init')
        })
    }

    // Create the sprite structure
    function build () {
        return _runSeries(__build).then(function () {
            return instance.emit('build')
        })
    }

    // Flip the sprite / horizontal mirror
    function flip () {
        htmlNode.classList.toggle('flip--true')
        return instance.emit('flip')
    }

    // Destroy completely the sprite and restore initial state
    function destroy () {
        _unbindEvents()

        styleNode.parentNode.removeChild(styleNode)
        htmlNode.parentNode.removeChild(htmlNode)

        imageNode = styleNode = bgNode = htmlNode = svgNode = proxyNode = proxyTimeout = null
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
    function getCurrentStep () {
        return currentStep
    }

    // Change the current frame/step (no animation)
    function changeStep (step = 1) {
        if (styleNode != null && htmlNode != null && imageNode != null) {
            // Hide the proxy
            htmlNode.classList.remove('proxy--visible')

            // If next step
            if (step === 'next') {
                step = _nextStep()
            }

            // If prev step
            if (step === 'previous') {
                step = _prevStep()
            }

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
                bgNode.style.backgroundPosition = '' + positionX + '% ' + positionY + '%'
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
    function changeProgress (progressValue = 0) {
        let stepEquiv = Math.round(progressValue * 100 * settings.steps / 100)
        if (stepEquiv === 0) stepEquiv++
        return changeStep(stepEquiv)
    }

    // Update current frame/step (animated)
    function animateStep (step, fps = 12, easing = 'ease') {
        // TODO
    }
}
