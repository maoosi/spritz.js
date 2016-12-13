/*!
* spritz.js 2.0.0 - A small, modern, responsive, sprites animation library.
* Copyright (c) 2016 maoosi <hello@sylvainsimao.fr> - https://github.com/maoosi/spritz.js
* License: MIT
*/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Spritz = factory());
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var knot = (function () {
  var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var events = {};

  function on(name, handler) {
    events[name] = events[name] || [];
    events[name].push(handler);
    return this;
  }

  function once(name, handler) {
    handler._once = true;
    on(name, handler);
    return this;
  }

  function off(name) {
    var handler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    handler ? events[name].splice(events[name].indexOf(handler), 1) : delete events[name];

    return this;
  }

  function emit(name) {
    var _this = this;

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    // cache the events, to avoid consequences of mutation
    var cache = events[name] && events[name].slice();

    // only fire handlers if they exist
    cache && cache.forEach(function (handler) {
      // remove handlers added with 'once'
      handler._once && off(name, handler);

      // set 'this' context, pass args to handlers
      handler.apply(_this, args);
    });

    return this;
  }

  return _extends({}, object, {

    on: on,
    once: once,
    off: off,
    emit: emit
  });
});

var Spritz = function () {

    /**
        --- CORE ---
    **/

    function Spritz(selector) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        classCallCheck(this, Spritz);

        // instance constructor
        this.options = {
            thickness: options.thickness || 22,
            color: options.color || 'red',
            length: options.length || 10,
            speed: options.speed || 15
        };

        this.selector = typeof selector === 'string' ? document.querySelector(selector) : selector;

        this.emitter = knot();

        this.initiated = false;

        return this;
    }

    createClass(Spritz, [{
        key: '_globalVars',
        value: function _globalVars() {
            // global vars
            this.canvas = false;
            this.ctx = false;
            this.snake = [];
            this.parentWidth = this.selector.clientWidth;
            this.parentHeight = this.selector.clientHeight;
            this.direction = 'right';
            this.directionQueue = this.direction;
            this.anim = false;
            this.starter = false;
        }
    }, {
        key: '_bindEvents',
        value: function _bindEvents() {
            var _this = this;

            // create events listeners
            this.resize = this._throttle(function (event) {
                _this._resize();
            }, 250);

            window.addEventListener('resize', this.resize, false);
        }
    }, {
        key: '_unbindEvents',
        value: function _unbindEvents() {
            // remove events listeners
            window.removeEventListener('resize', this.resize, false);
        }
    }, {
        key: '_resize',
        value: function _resize() {
            // viewport resize triggered
            this.parentWidth = this.selector.clientWidth;
            this.parentHeight = this.selector.clientHeight;
            this.canvas.setAttribute('width', this.parentWidth);
            this.canvas.setAttribute('height', this.parentHeight);
            this.ctx = this.canvas.getContext('2d');
            this._drawSnake();

            this.emitter.emit('resize');
        }

        /**
            --- API ---
        **/

    }, {
        key: 'init',
        value: function init() {
            // init vars, canvas, and snake
            if (!this.initiated) {
                this._globalVars();
                this._createCanvas();
                this._createSnake();
                this._drawSnake();
                this._bindEvents();

                this.initiated = true;
                this.emitter.emit('init');
            }

            return this;
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            // destroy snake & instance
            if (this.initiated) {
                this.stop();
                this._unbindEvents();
                this.canvas.parentNode.removeChild(this.canvas);
                this.canvas = false;
                this.ctx = false;
                this.snake = [];

                this.initiated = false;
                this.emitter.emit('destroy');

                this.emitter.off('init');
                this.emitter.off('destroy');
                this.emitter.off('reset');
                this.emitter.off('play');
                this.emitter.off('pause');
                this.emitter.off('stop');
                this.emitter.off('resize');
                this.emitter.off('draw');
            }

            return this;
        }
    }, {
        key: 'play',
        value: function play() {
            // play animation
            this._playAnimation();

            this.emitter.emit('play');

            return this;
        }
    }, {
        key: 'pause',
        value: function pause() {
            // stop animation
            this._pauseAnimation();

            this.emitter.emit('pause');

            return this;
        }
    }, {
        key: 'stop',
        value: function stop() {
            // stop animation
            this.pause();
            this.reset();

            this.emitter.emit('stop');

            return this;
        }
    }, {
        key: 'on',
        value: function on() {
            var _emitter;

            return (_emitter = this.emitter).on.apply(_emitter, arguments);
        }
    }, {
        key: 'off',
        value: function off() {
            var _emitter2;

            return (_emitter2 = this.emitter).off.apply(_emitter2, arguments);
        }
    }, {
        key: 'once',
        value: function once() {
            var _emitter3;

            return (_emitter3 = this.emitter).once.apply(_emitter3, arguments);
        }

        /**
            --- ANIMATE ---
        **/

    }, {
        key: '_playAnimation',
        value: function _playAnimation() {
            var _this2 = this;

            // start snake animation
            this.anim = window.requestAnimationFrame(function (timestamp) {
                _this2._animStep(timestamp);
            });
        }
    }, {
        key: '_pauseAnimation',
        value: function _pauseAnimation() {
            // pause snake animation
            if (this.anim) {
                window.cancelAnimationFrame(this.anim);
                this.anim = false;
                this.starter = false;
            }
        }

        /**
            --- DETECT ---
        **/

        /**
            --- DRAW ---
        **/

    }]);
    return Spritz;
}();

return Spritz;

})));
