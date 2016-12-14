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
        this.options = {};

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
            this.parentWidth = this.selector.clientWidth;
            this.parentHeight = this.selector.clientHeight;

            this.waitQueue = [];
            this.waitTimer = false;
            this.waitExecution = false;
        }
    }, {
        key: '_throttle',
        value: function _throttle(callback, delay) {
            var _this = this,
                _arguments = arguments;

            // throttle function
            var last = void 0;
            var timer = void 0;
            return function () {
                var context = _this;
                var now = +new Date();
                var args = _arguments;
                if (last && now < last + delay) {
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        last = now;
                        callback.apply(context, args);
                    }, delay);
                } else {
                    last = now;
                    callback.apply(context, args);
                }
            };
        }
    }, {
        key: '_bindEvents',
        value: function _bindEvents() {
            var _this2 = this;

            // create events listeners
            this.resize = this._throttle(function (event) {
                _this2._resize();
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
                this._bindEvents();

                this.initiated = true;
                this.emitter.emit('init');
            }

            return this;
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            var _this3 = this;

            // destroy snake & instance
            return this._handleWait(function () {
                if (_this3.initiated) {
                    // stop stuff
                    _this3.stop();
                    _this3._unbindEvents();

                    // reset & remove canvas
                    _this3.canvas.parentNode.removeChild(_this3.canvas);
                    _this3.canvas = false;
                    _this3.ctx = false;

                    // turn initiated to false
                    _this3.initiated = false;

                    // emitt destroy
                    _this3.emitter.emit('destroy');

                    // turn off emitters
                    _this3.emitter.off('init');
                    _this3.emitter.off('destroy');
                    _this3.emitter.off('resize');
                    _this3.emitter.off('play');
                    _this3.emitter.off('playback');
                    _this3.emitter.off('wait');
                    _this3.emitter.off('pause');
                    _this3.emitter.off('stop');
                }
            });
        }
    }, {
        key: 'play',
        value: function play(fps) {
            var _this4 = this;

            // play animation
            return this._handleWait(function () {
                _this4._playAnimation();

                console.log('playing');

                _this4.emitter.emit('play');
            });
        }
    }, {
        key: 'playback',
        value: function playback(fps) {
            var _this5 = this;

            // play animation
            return this._handleWait(function () {
                _this5._playAnimation();

                console.log('playing backwards');

                _this5.emitter.emit('playback');
            });
        }
    }, {
        key: 'pause',
        value: function pause() {
            var _this6 = this;

            var silent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            // stop animation
            return this._handleWait(function () {
                _this6._pauseAnimation();

                if (!silent) {
                    console.log('paused');
                    _this6.emitter.emit('pause');
                }
            });
        }
    }, {
        key: 'stop',
        value: function stop() {
            var _this7 = this;

            // stop animation
            return this._handleWait(function () {
                _this7.pause(true);
                _this7._resetAnimation();

                console.log('stopped');

                _this7.emitter.emit('stop');
            });
        }
    }, {
        key: 'wait',
        value: function wait(milliseconds) {
            var _this8 = this;

            // chainable timeout
            return this._handleWait(function () {
                _this8.emitter.emit('wait');
                console.log('waiting for ' + milliseconds + 'ms');
            }, milliseconds);
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
            --- WAIT ---
        **/

    }, {
        key: '_handleWait',
        value: function _handleWait(func) {
            var milliseconds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            this.waitQueue.push({
                'func': func,
                'timeout': milliseconds
            });
            return this.waitExecution ? this : this._processNext();
        }
    }, {
        key: '_processNext',
        value: function _processNext() {
            var _this9 = this;

            if (this.waitQueue.length > 0) {
                var current = this.waitQueue.shift();
                var f = current['func'];
                var t = current['timeout'];

                if (t !== false) {
                    f();
                    this.waitExecution = true;
                    this.waitTimer = setTimeout(function () {
                        _this9._processNext();
                    }, t);
                } else {
                    this.waitExecution = false;
                    f();
                    this._processNext();
                }
            }

            return this;
        }

        /**
            --- ANIMATE ---
        **/

    }, {
        key: '_resetAnimation',
        value: function _resetAnimation() {
            // reset animation to its initial state

        }
    }, {
        key: '_playAnimation',
        value: function _playAnimation() {
            // start animation
            this.anim = window.requestAnimationFrame(function (timestamp) {
                // this._animStep(timestamp)
            });
        }
    }, {
        key: '_pauseAnimation',
        value: function _pauseAnimation() {
            // pause animation
            if (this.anim) {
                window.cancelAnimationFrame(this.anim);
                this.anim = false;
                this.animStarter = false;
            }
        }

        /**
            --- DETECT ---
        **/

        // ->

        /**
            --- DRAW ---
        **/

        // ->

    }]);
    return Spritz;
}();

return Spritz;

})));
