export default class Spritz {

  spritz(target, options = {}) {
    this.options = {
		start: options.start || 0,
        stop: options.stop || window.height,
        steps: 8,
        lines: options.lines || 1,

        spriteWidth: 1024,
        spriteHeight: 1024,
        spriteFile: 'http://kwiksher.com/wp-content/uploads/2012/09/runningcat.png',

        beforeRender: function(sprites) {},
        afterRender: function(sprites) {},
        beforeStart: function(sprites) {},
        afterStop: function(sprites) {}
    }
  }

  _uniqid() {
	  return uniqid;
  }

  _generateCSS() {

  }

}
