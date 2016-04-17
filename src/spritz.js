import knot from 'knot.js'

export default (target, options = {}) => {

	/**
	 * Variables
	 */

	let windowsHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

	const settings = {
		start: options.start || 0,
		stop: options.stop || windowsHeight,
		steps: options.steps,
		rows: options.rows || 1,

		responsive: options.responsive || false,
		scroller: options.scroller || 'body',

		spriteWidth: options.spriteWidth,
		spriteHeight: options.spriteHeight,
		spritePath: options.spritePath,

		beforeRender: function() {},
		afterRender: function() {},
		beforeStart: function() {},
		afterStop: function() {}
	}

	const run = [
		_generateCSS
	]


	/**
	 * Expose public methods
	 * https://github.com/callmecavs/knot.js
	 */

	const instance = knot({
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
	}

	// Load the sprite image
	function load() {
		return instance.emit('load')
	}

	// Unload the sprite from browser memory
	function unload() {
		return instance.emit('unload')
	}

	// Destroy completely the sprite and restore initial state
	function destroy() {
		return instance.emit('destroy')
	}

	// Listen for user scroll
	function listen() {
		return instance.emit('listen')
	}

	// Stop listening for user scroll
	function mute() {
		return instance.emit('mute')
	}

}
