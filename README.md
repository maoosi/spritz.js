# Spritz.js

A small, modern, responsive, **sprites animation library**.

🚀 Try the [**Demo samples**](http://codepen.io/collection/XQZjMx/).

## Features

**Can be used for:** 360 viewers, products animation, interactive experiences, html5 games...

* **Accessible** - full support for screen readers
* **Lightweight** - under 13KB minified and gzipped
* **Responsive** - multiple built-in display modes
* **Modern** - written in ES6 JavaScript, no jQuery required
* **[Compatible](#browser-support)** - IE9+ support, mobile support
* **[API / Events](#api--events)** - play, pause, wait, and more

Oh and yes, it is compatible with [ScrollMagic](http://scrollmagic.io).

## Getting Started

1. [Installation](#installation)
2. [Usage](#usage)
3. [Options](#options)
4. [API / Events](#api--events)
5. [Browser Support](#browser-support)
6. [Projects Using Spritz](#projects-using-spritz)
7. [License](#license)

## Installation

### Using NPM

```bash
npm i spritz.js --save
```

### jsDelivr CDN

```bash
<script src="https://cdn.jsdelivr.net/spritz.js/2.0.0/spritz.js"></script>
```

## Usage

```javascript
// ES6 module import
import Spritz from 'spritz.js' // not required if using a CDN or directly include

// instantiate with options
const sprite = new Spritz('#selector', { /* options here */ })

// basic usage: build & load the sprite
sprite.init()
```

## Options

Settings overview list:

```javascript
Spritz('#selector', {
	src: 'path/to/sprite.png',
    mask: 'path/to/mask.png',
	width: 6470,
	height: 3096,
	steps: 18,
	rows: 4,
	display: 'fluid',
	ariaLabel: 'Sprite image used for presentation purpose'
})
```

Option details are detailed below.

Option | Type | Default | Description
---|---|---|---
`thickness` | *integer* | `22` | Thickness of the snake body (the snake body is made of multiple squares, where thickness represents the width and height of each square).
`color` | *string or array* | `red` | Color of the snake body (RGB or hexadecimal). Can be a single color `#3498db`, or a two colors gradient by using a array[2] `['#0000ff', '#ffffff']`.
`length` | *integer* | `10` | Length of the snake body or tail length (also represents the number of squares that the body is made of).
`speed` | *integer* | `15` | Speed of the snake animation (FPS).

## API / Events

Spritz exposes the following methods, and corresponding events:

* [init](#init)
* [destroy](#destroy)
* [play](#playfps-direction)
* [pause](#pause)
* [stop](#stop)
* [changeStep](#changestepstep)
* [changeProgress](#changeprogressprogressvalue)
* [flip](#flip)
* [getCurrentStep](#getcurrentstep) (not chainable)
* [isMaskingSupported](#ismaskingsupported) (not chainable)

Note that **all methods** *(Except the ones specified above)*, **including those from the event emitter, are chainable**.

### .init()

Used to initiate the _sprite build_ **AND** the _sprite load_, within the container.

```javascript
// build & load the sprite
instance.init()

// 'init' is emitted AFTER the sprite has been loaded and built into the viewport
instance.on('init', () => {
  // ...
})
```

### .load()

Used to _preload the sprite image_. It allows you to manually load a heavy sprite, without displaying it.

```javascript
// load the sprite image
instance.load()

// 'load' is emitted AFTER the sprite has been loaded
instance.on('load', () => {
  // ...
})
```

### .build()

Used to _build the DOM structure and the CSS properties_. Then, display the sprite into the user viewport.

```javascript
// build the DOM and the CSS. Then, display the sprite
instance.build()

// 'build' is emitted AFTER the sprite has been built into the viewport
instance.on('build', () => {
  // ...
})
```

### .destroy()

Used to _completely destroy the sprite element and behaviors_. Restore the intial state.

```javascript
// destroy completely the sprite, and restore initial state
instance.destroy()

// 'destroy' is emitted AFTER the sprite has been destroyed
instance.on('destroy', () => {
  // ...
})
```

### .play(fps, direction)

Used to _start sprite loop animation_. Useful for playing infinite loop animations.

**Parameters:**

* fps (integer): frames per second. Default: 12
* direction (string): "forward" OR "backward". Default: "forward"

```javascript
// play loop animation with default parameters
instance.play()

// play loop animation at 25 fps, 'backward'
instance.play(25, 'backward')

// 'play' is emitted AFTER the animation has started
instance.on('play', () => {
  // ...
})
```

### .pause()

Used to _pause sprite loop animation_.

```javascript
// pause loop animation
instance.pause()

// 'pause' is emitted AFTER the animation loop has paused
instance.on('pause', () => {
  // ...
})
```

### .stop()

Used to _stop and reset the sprite loop animation_ to its initial step.

```javascript
// stop loop animation
instance.stop()

// 'stop' is emitted AFTER the animation loop has stopped
instance.on('stop', () => {
  // ...
})
```

### .changeStep(step)

Used to _change the current active step of the sprite_.

**Parameters:**

* step (integer): step / frame number. Default: 1
	* |-- Also support keywords "previous" and "next".

```javascript
// change the current active step to 3
instance.changeStep(3)

// change the current active step to the previous step
instance.changeStep('previous')

// 'change' is emitted AFTER the sprite step has been changed
instance.on('change', () => {
  // ...
})
```

### .changeProgress(progressValue)

Used to _change the current progress step of the sprite_. First step / frame is 0. Last step / frame is 1. This can be useful if you want to combine Spritz and Scroll Magic with custom actions (cf: http://scrollmagic.io/examples/basic/custom_actions.html).

**Parameters:**

* progressValue (float): progress value between 0 and 1. Default: 0

```javascript
// change the current progress to 0.2 (20%)
instance.changeProgress(0.2)

// 'change' is emitted AFTER the sprite step has been changed
instance.on('change', () => {
  // ...
})
```

### .flip()

Used to _flip the sprite / horizontally mirror the sprite_.

```javascript
// flip the sprite
instance.flip()
```

### .getCurrentStep()

Return the current active step / frame of the sprite.

```javascript
// Get the current sprite step
instance.getCurrentStep()
```

### .isMaskingSupported()

Return true or false, depending if the masking feature is supported by the browser or not.

> **To perfom the masking, Spritz uses SVG containers with mask elements.** Support based on http://caniuse.com/#feat=svg

```javascript
// Test if masking is supported
instance.isMaskingSupported()
```

## Browser Support

Spritz is fully supported by **Evergreen Browsers** (Edge, Opera, Safari, Firefox & Chrome) and IE 10+ browsers.

**Few notes about compatibility:**

* There is known issues with **Safari** and SVG's that makes rendering very slow. Thereby, masking is disabled for Safari.
* If your browser **doesn't support SVG**, spritz.js will gracefully disable masking.
* In order to limit data usage on **mobile devices**, proxy replacement has been disabled by default.
* For **old browser support like IE 9**, you'll need to manually add the classList polyfill into your project (https://github.com/eligrey/classList.js/)

## Projects Using Spritz

* **Mars Australia** | SNICKERS® Hungerithm | http://www.hungerithm.com
* **TAC Victoria** | Meet Graham | http://www.meetgraham.com.au

## License

[MIT](https://github.com/maoosi/spritz.js/blob/master/LICENSE.md) © 2016 Sylvain Simao

[![Built With Love](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)
