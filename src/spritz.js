import knot from 'knot.js'

export default (target, options = {}) => {

	/**
	 * Variables
	 */

	let windowsHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

	const settings = {
		container: options.container || 'body'
		steps: options.steps,
		rows: options.rows || 1,
		width: options.width,
		height: options.height,
		src: options.src
	}

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
		listen: listen,
		mute: mute
	})

	return instance


	/**
	 * Private methods
	 */

	// Run a serie of functions
	function _runSeries(functions) {
		functions.forEach(func => func())
	}

	// Return an uniqid
	function _uniqid() {
		return uniqid;
	}

	// Generate the CSS steps
	function _generateCSS() {

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

	// Return the current frame/step
	function getStep(step) {
		return instance.emit('stepChanged')
	}

	// Change the current frame/step (no animation)
	function setStep(step = 0) {
		return instance.emit('stepChanged')
	}

	// Update current frame/step (animated)
	function goToStep(step, reverse = false, fps = 12) {
		return instance.emit('play')
	}

	// Stop listening for user scroll
	function muteScroll() {
		return instance.emit('muteScroll')
	}

}
