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
	let backgroundSize = null
	let sprite = {
		columns: null,
		padding: null,
		width: null,
		height: null
	}


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

	// Generate the CSS
	function _generateCSS() {
		if (styleNode === null && imageNode != null) {

			let spriteBehavior = ``
			let css = ``

			// if responsive option, width = 100% & height = proportional
			if (settings.responsive === true) {
				spriteBehavior =
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
				spriteBehavior =
					`
					position: absolute;
					width: ${sprite.width}px;
					height: ${sprite.height}px;
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

	// Return the current frame/step
	function getStep(step) {

	}

	// Change the current frame/step (no animation)
	function setStep(step = 1) {
		console.log(step)

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

			// Emit changed
			return instance.emit('changed')

		}
	}

	// Update current frame/step (animated)
	function goToStep(step, fps = 12) {

	}

}
