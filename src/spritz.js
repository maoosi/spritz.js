import knot from 'knot.js'

export default (target, options = {}) => {

	/**
	 * Default settings
	 */

	const settings = {
		container: options.container || 'body',
		steps: options.steps,
		rows: options.rows || 1,
		width: options.width,
		height: options.height,
		src: options.src
	}


	/**
	 * Useful constants
	 */

	const windowsHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	const uniqid = Symbol();


	/**
	 * Series of functions
	 */

	const run = [
		_generateCSS
	]


	/**
	 * Expose public methods
	 * https://github.com/callmecavs/knot.js
	 */

	const instance = knot({
		init: init,
		load: load,
		unload: load,
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
		functions.forEach(func => func())
	}

	// Generate the CSS steps
	function _generateCSS() {

		console.log(uniqid);

		let css =
		`
		.sprite {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			background:  url('http://bennet.org/images/codepen/ryu-sprite-demo.png') no-repeat 0 0%;
			background-size: 100%;
			animation: sprite 3.5s steps(45) infinite;
		}

		@keyframes sprite {
			from { background-position: 0 0%; }
			to { background-position: 0 100%; }
		}
		`


	}


	/**
	 * Public methods
	 */

	// Init the instance
	function init() {
		_generateCSS()
		return instance.emit('init')
	}

	// Load the sprite image
	function load() {
		return instance.emit('loaded')
	}

	// Unload the sprite from browser memory
	function unload() {
		return instance.emit('unloaded')
	}

	// Destroy completely the sprite and restore initial state
	function destroy() {
		return instance.emit('destroy')
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
		return instance.emit('stepChanged')
	}

	// Change the current frame/step (no animation)
	function setStep(step = 0) {
		return instance.emit('stepChanged')
	}

	// Update current frame/step (animated)
	function goToStep(step, fps = 12) {
		return instance.emit('play')
	}

}
