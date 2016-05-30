import 'classlist.js' // Cross-browser element.classList - https://github.com/eligrey/classList.js/
import knot from 'knot.js' // A browser-based event emitter - https://github.com/callmecavs/knot.js
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
        displayMode: options.displayMode || 'fluid',
        breakpoint: options.breakpoint || 640,

        src: options.src,
        mask: options.mask || false,
        proxy: options.proxy || false,

        ariaLabel: options.ariaLabel || 'Sprite image used for presentation purpose'
    }


    /**
    * Local variables
    */

    let imageNode = null
    let mainNode = null
    let svgNode = null
    let proxyNode = null
    let fallbackNode = null

    let proxyImagesList = []
    let proxyTimeout = null
    let backgroundSize = null
    let sprite = {
        columns: null,
        width: null,
        height: null,
        ratio: null
    }
    let currentStep = settings.initial
    // let currentLoop = 0
    let frameRequest = null


    /**
    * Series of functions
    */

    const __build = [
        _calculations,
        _generateMain,
        _generateSVG,
        _generateProxy,
        _accessibility,
        _bindEvents,
        _defaultStep,
        _generateCSS,
        flip
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
        start: start,
        stop: stop,
        animateStep: animateStep,
        getCurrentStep: getCurrentStep,
        isMaskingSupported: isMaskingSupported,
        flip: flip
    })

    return instance


    /**
    * Private helper functions
    */

    // Run a serie of functions
    function __runSeries (functions) {
        return new Promise(function (resolve, reject) {
            resolve(functions.forEach(func => func()))
        })
    }

    // Convert and return the input to camelCase
    function __camelize (str) {
        return str.replace(/(\-[a-z])/g, function ($1) {
            return $1.toUpperCase().replace('-', '')
        })
    }

    // Prefix a CSS property
    function __prefixCss (element, property, value) {
        let capitalizedProperty = property.charAt(0).toUpperCase() + property.slice(1)
        element.style['webkit' + capitalizedProperty] = value
        element.style['moz' + capitalizedProperty] = value
        element.style['ms' + capitalizedProperty] = value
        element.style['o' + capitalizedProperty] = value
        element.style[property] = value
    }

    // Apply multiple dom attributes at once
    function __setAttributes (element, attributes) {
        if (element !== null) {
            for (let attribute in attributes) {
                element.setAttribute(attribute, attributes[attribute])
            }
        }
    }

    // Apply multiple CSS rules at once
    function __setCss (element, rules) {
        if (element !== null) {
            for (let rule in rules) {
                if (rule === 'transform') {
                    __prefixCss(element, 'transform', rules[rule])
                } else {
                    element.style[__camelize(rule)] = rules[rule]
                }
            }
        }
    }

    // Apply multiple CSS rules on multiple elements
    function __css (elements, rules) {
        if (elements !== null && elements.constructor === Array) {
            for (let i = 0; i < elements.length; i++) {
                __setCss(elements[i], rules)
            }
        } else {
            __setCss(elements, rules)
        }
    }


    /**
    * Private methods
    */

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

        // sprite ratio used for fluid display
        sprite.ratio = sprite.width / sprite.height
    }

    // Generate the main DOM
    function _generateMain () {
        if (mainNode === null) {
            mainNode = document.createElement('div')
            fallbackNode = document.createElement('div')
            mainNode.appendChild(fallbackNode)

            if (typeof settings.container === 'object') {
                settings.container.appendChild(mainNode)
            } else {
                document.querySelector(settings.container).appendChild(mainNode)
            }
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
            _unbindEvents()
            build()
        }, 500)
    }

    // Generate accessibility tags
    function _accessibility () {
        __setAttributes(mainNode, {
            'role': 'img',
            'aria-label': settings.ariaLabel,
            'tabindex': '0',
            'aria-hidden': 'false'
        })
    }

    // Generate the proxy dom
    function _generateProxy () {
        if (proxyNode === null) {
            proxyNode = document.createElement('div')
            mainNode.appendChild(proxyNode)
        }
    }

    // Generate the JPG/PNG mask using SVG
    function _generateSVG () {
        if (_canUseSVG() && settings.mask !== false && svgNode === null) {
            svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            svgNode.innerHTML =
                `<defs>
                    <mask id="spritzTopMask">
                        <image width="${settings.width}" height="${settings.height}" xlink:href="${settings.mask}"></image>
                    </mask>
                </defs>
                <image mask="url(#spritzTopMask)" id="spritzTop" width="${settings.width}" height="${settings.height}" xlink:href="${settings.src}"></image> `
            __setAttributes(svgNode, {
                'preserveAspectRatio': 'xMinYMin',
                'width': '100%',
                'height': '100%',
                'version': '1.1',
                'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                'viewBox': '0 0 ' + sprite.width + ' ' + sprite.height + ''
            })
            mainNode.appendChild(svgNode)
        }
    }

    // Return true if SVG Mask can be used by the browser
    function _canUseSVG () {
        // SVG Masking disabled for Safari
        // (http://stackoverflow.com/questions/31384271/safari-unreasonably-slow-rendering-svg-files)
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
        // Generic rules
        __css(mainNode, {
            'overflow': 'hidden',
            'outline': '0'
        })
        __css(fallbackNode, {
            'position': 'absolute',
            'top': '0',
            'left': '0',
            'width': '100%',
            'height': '100%',
            'background-size': '' + backgroundSize + '%',
            'background-position': '0 0',
            'background-repeat': 'no-repeat'
        })
        __css(svgNode, {
            'position': 'absolute',
            'top': '0',
            'left': '0',
            'opacity': '1'
        })
        __css(proxyNode, {
            'position': 'absolute',
            'left': '-9999px',
            'top': '0',
            'width': '100%',
            'height': '100%',
            'opacity': '0',
            'background-repeat': 'no-repeat',
            'background-size': '100%',
            'background-position': '0 0'
        })

        // Conditional rules
        if (settings.displayMode === 'fluid') {
            __css(mainNode, {
                'position': 'relative',
                'width': '100%',
                'height': '' + (mainNode.parentNode.offsetWidth / sprite.ratio) + 'px'
            })
        } else {
            __css(mainNode, {
                'position': 'absolute',
                'left': '50%',
                'top': '50%',
                'transform': 'translate(-50%, -50%)',
                'width': '' + sprite.width + 'px',
                'height': '' + sprite.height + 'px'
            })
        }
        if (imageNode !== null) {
            __css(fallbackNode, {
                'background-image': 'url("' + imageNode.src + '")'
            })
        }
        if (svgNode !== null) {
            __css(fallbackNode, {
                'opacity': '0'
            })
        }
    }

    // Show proxy CSS rules
    function _showProxy () {
        __css([svgNode, fallbackNode], {
            'transition': 'opacity 0.6s linear 0.7s',
            'opacity': '0'
        })

        __css(proxyNode, {
            'transition': 'opacity 0.6s linear 0.1s',
            'opacity': '1',
            'left': '0'
        })
    }

    // Hide proxy CSS rules
    function _hideProxy () {
        if (svgNode !== null) {
            __css(svgNode, {
                'transition': 'none',
                'opacity': '1'
            })
        } else {
            __css(fallbackNode, {
                'transition': 'none',
                'opacity': '1'
            })
        }

        __css(proxyNode, {
            'transition': 'none',
            'opacity': '0',
            'left': '-9999px'
        })
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
        if (typeof settings.proxy[step] === 'undefined') { return }

        // Disable for mobile devices
        let viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
        if (settings.breakpoint !== false && viewportWidth < settings.breakpoint) { return }

        // If the proxy dom element exists, we can load the proxy image
        if (proxyNode !== null) {
            let proxySrc = settings.proxy[step]
            _loadProxyImage(proxySrc).then(function (proxyImage) {
                __css(proxyNode, {'background-image': 'url("' + proxyImage.getAttribute('src') + '")'})
                _showProxy()

                // IE Fix for rendering
                setTimeout(function () {
                    proxyNode.style.left = '0'
                }, 100)
            })
        }
    }

    // Frame animation
    function _requestAnimation (interval, step = 'next', lastTime = 0, easing = false, timeElapsed = null, startStep = null, endStep = null, timeTotal = null) {
        frameRequest = window.requestAnimationFrame(function (timestamp) {
            _loopAnimation(interval, step, timestamp, lastTime, easing, timeElapsed, startStep, endStep, timeTotal)
        })
    }

    // Loop animation
    function _loopAnimation (interval, step, timestamp, lastTime, easing, timeElapsed, startStep, endStep, timeTotal) {
        let update = timestamp - lastTime >= interval

        if (update) {
            let nextStep

            if (easing !== false) {
                nextStep = easing(timeElapsed, startStep, endStep, timeTotal)
                timeElapsed += interval

                if (nextStep >= endStep) {
                    changeStep(endStep, true)
                    stop(true)
                    return
                } else {
                    nextStep = Math.round(nextStep)
                }
            } else {
                nextStep = step
            }

            changeStep(nextStep)
            lastTime = timestamp
        }

        _requestAnimation(interval, step, lastTime, easing, timeElapsed, startStep, endStep, timeTotal)
    }


    /**
    * Public methods
    */

    // Initiate the instance
    function init (initial = null) {
        if (initial !== null) settings.initial = initial
        __runSeries(__init).then(function () {
            instance.emit('init')
        })
        return this
    }

    // Create the sprite structure
    function build () {
        __runSeries(__build).then(function () {
            instance.emit('build')
        })
        return this
    }

    // Flip the sprite / horizontal mirror
    function flip (doFlip = settings.flip) {
        if (doFlip === true) {
            __css([fallbackNode, proxyNode, svgNode], {
                'transform': 'scaleX(-1)',
                'filter': 'fliph()',
                '-ms-filter': 'FlipH'
            })
        } else {
            __css([fallbackNode, proxyNode, svgNode], {
                'transform': 'none',
                'filter': 'none',
                '-ms-filter': 'none'
            })
        }
        return this
    }

    // Destroy completely the sprite and restore initial state
    function destroy () {
        _unbindEvents()
        mainNode.parentNode.removeChild(mainNode)
        imageNode = fallbackNode = mainNode = svgNode = proxyNode = proxyTimeout = null
        proxyImagesList = []
        stop(true)
        instance.emit('destroy')
        return this
    }

    // Load the sprite image
    function load () {
        if (imageNode === null) {
            imageNode = new Image()
            imageNode.onload = function () { instance.emit('load') }
            imageNode.src = settings.src
        }
        return this
    }

    // Return true if SVG Masking is supported
    function isMaskingSupported () {
        return _canUseSVG
    }

    // Return the current number of loop already performed
    /* function getCurrentLoop () {
        return currentLoop
    } */

    // Return the current frame/step
    function getCurrentStep () {
        return currentStep
    }

    // Change the current frame/step (no animation)
    function changeStep (step = 1, silent = false) {
        if (mainNode != null && imageNode != null) {
            // Hide the proxy
            _hideProxy()

            // If next or previous step
            step = (step === 'next') ? _nextStep() : (step === 'previous') ? _prevStep() : step

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

                svgNode.setAttribute(
                    'viewBox', '' + positionX + ' ' + positionY + ' ' + sprite.width + ' ' + sprite.height + ''
                )
            } else {
                fallbackNode.style.backgroundPosition = '' + positionX + '% ' + positionY + '%'
            }

            // Save current step
            currentStep = step

            // Fire proxy replacement after a certain time on a frame
            clearTimeout(proxyTimeout)
            if (frameRequest === null) {
                proxyTimeout = setTimeout(function () {
                    _proxy(step)
                }, 500)
            }

            // Emit changed
            if (silent === false) instance.emit('change')
        }
        return this
    }

    // Set a progress value: 0 = first step / 1 = last step
    function changeProgress (progressValue = 0) {
        let stepEquiv = Math.round(progressValue * 100 * settings.steps / 100)
        return changeStep(stepEquiv === 0 ? stepEquiv + 1 : stepEquiv)
    }

    // Start loop animation
    function start (direction = 'forward', fps = 12) {
        let interval = 1000 / fps
        if (fps === 0) stop()
        _requestAnimation(interval, direction === 'forward' ? 'next' : 'previous')
        instance.emit('start')
        return this
    }

    // Stop loop animation
    function stop (silent = false) {
        if (frameRequest !== null) {
            window.cancelAnimationFrame(frameRequest)
            frameRequest = null
            if (silent === false) instance.emit('stop')
        }
        return this
    }

    // Update current frame/step (animated)
    function animateStep (step, direction = 'forward', fps = 12, easing = 'ease') {
        if (frameRequest !== null) stop()
        let interval = 1000 / fps
        let timeTotal = (step - currentStep) * interval
        if (direction === 'backward') timeTotal = (currentStep - step) * interval

        // t: current time, b: begInnIng value, c: change In value, d: duration
        if (easing === 'ease' || easing === 'easeInOut') {
            // easeInOutSin
            easing = function (t, b, c, d) {
                return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b
            }
        } else if (easing === 'easeIn') {
            // easeInSine
            easing = function (t, b, c, d) {
                return -c * Math.cos(t / d * (Math.PI / 2)) + c + b
            }
        } else if (easing === 'easeOut') {
            // easeOutSine
            easing = function (t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b
            }
        }

        // requestAnimation
        _requestAnimation(interval, direction, 0, easing, interval, currentStep, step, timeTotal)
        instance.emit('animate')
        return this
    }
}
