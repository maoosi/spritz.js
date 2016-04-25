import knot from 'knot.js'
import shortid from 'shortid'


export default (options = {}) => {

	/**
	 * Default settings
	 */

	const settings = {
		container: options.container || 'body',
		responsive: options.responsive || false,
		steps: options.steps,
		rows: options.rows || 1,
		width: options.width,
		height: options.height,
		src: options.src
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
	let spriteColumns = null
	let extraCSS = null
	let backgroundSize = null


	/**
	 * Series of functions
	 */

	const generate = [
		_calculations,
		_generateDOM,
		_generateCSS
	]

	const run = [
		load,
		display
	]


	/**
	 * Expose public methods
	 * https://github.com/callmecavs/knot.js
	 */

	const instance = knot({
		init: init,
		load: load,
		display: display,
		destroy: destroy,
		listenScroll: listenScroll,
		muteScroll: muteScroll,
		getStep: getStep,
		setStep: setStep,
		goToStep: goToStep
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
		spriteColumns = Math.ceil(settings.steps / settings.rows)

		// what's background sizes
		backgroundSize = 100 * spriteColumns

		// fixed width calculation
		let spriteWidth = settings.width / spriteColumns
		spriteWidth = (Math.round((spriteWidth * 1000)/10)/100).toFixed(2)

		// fixed height calculation
		let spriteHeight = settings.height / settings.rows
		spriteHeight = (Math.round((spriteHeight * 1000)/10)/100).toFixed(2)

		// width = 100% & relative height
		if (settings.responsive === true) {
			let spritePadding = ((spriteHeight*100) * 100 / (spriteWidth*100))
			extraCSS =
				`
				#sprite-${uniqid} {
					position: relative;
					width: 100%;
				}

				#sprite-${uniqid}::after {
					content: '';
  					display: block;
  					padding-bottom: ${spritePadding}%;
				}
				`
		// fixed sizes
		} else {
			extraCSS =
				`
				#sprite-${uniqid} {
					position: absolute;
					width: ${spriteWidth}px;
					height: ${spriteHeight}px;
				}
				`
		}
	}

	// Generate the DOM
	function _generateDOM() {
		if (htmlNode === null) {
			htmlNode = document.createElement('div')
			document.querySelector(settings.container).appendChild(htmlNode).setAttribute('id', 'sprite-'+ uniqid +'')
		}
	}

	// Generate the CSS
	function _generateCSS() {
		if (styleNode === null && imageNode != null) {

			// generate the css
			let css =
				`
				#sprite-${uniqid} {
					left: 0; right: 0; top: 0; bottom: 0;
					background: url('${imageNode.src}') no-repeat 0 0%;
					background-size: ${backgroundSize}%;
					animation: sprite-anim-${uniqid} 4s steps(${spriteColumns}) infinite;
				}

				${extraCSS}
				`

			//keyframes
			// css += `@keyframes sprite-anim-${uniqid} {`
			// css += `0% { background-position: 0 0; }`
			// for (let i = 1; i <= settings.steps-1; i++) {
			// 	let currPrct = (100 / (settings.steps-1)) * i
			// 	let currPosX = (i % spriteColumns) * (backgroundSize / spriteColumns)
			// 	let currPosY = (i % settings.rows) * (backgroundSize / settings.rows)
			// 	css +=
			// 		`
			// 		${currPrct}% { background-position: ${currPosX}% ${currPosY}%; }
			// 		`
			// }
			// css += `}`

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
		_runSeries(run).then(function() {
			return instance.emit('init')
		})
	}

	// Display the sprite
	function display() {
		_runSeries(generate).then(function() {
			return instance.emit('display')
		})
	}

	// Destroy completely the sprite and restore initial state
	function destroy() {
		imageNode = null
		// TODO: Set background to 'none' & destroy dom
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

	// Listen for user scroll
	function listenScroll(from = 0, to = windowsHeight, scroller = 'body') {
		return instance.emit('listenScroll')
	}

	// Stop listening for user scroll
	function muteScroll() {
		return instance.emit('muteScroll')
	}

	// Return the current frame/step
	function getStep(step) {

	}

	// Change the current frame/step (no animation)
	function setStep(step = 0) {
		// 	let currPrct = (100 / (settings.steps-1)) * i
		// 	let currPosX = (i % spriteColumns) * (backgroundSize / spriteColumns)
		// 	let currPosY = (i % settings.rows) * (backgroundSize / settings.rows)
		console.log(step)
		return instance.emit('stepChanged')
	}

	// Update current frame/step (animated)
	function goToStep(step, fps = 12) {
		return instance.emit('play')
	}

}
