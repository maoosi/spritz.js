# Spritz.js

> **WORK IN PROGRESS** - **NOT PUBLISHED ON NPM** - **DOCUMENTATION WRITING IN PROGRESS**

A small, modern, dependency-free, **sprites animation library**.

## Work in progress

* [ ] Version 1.0.0
* [ ] Testing
* [ ] Documentation
* [ ] Publish on NPM
* [ ] Publish on JSDelivr
* [ ] Demo samples on Codepen
* [ ] Animated transitions between steps (incl. FPS and easing options)
* [ ] Debug mode with detailed console outputs
* [ ] Options: From, To
* [ ] Loop animation API: FPS, Start, Stop, Flip, Range ...

## Getting Started

1. [Installation](#installation)
2. [Usage](#usage)
3. [Options](#options)
4. [API / Events](#api--events)
5. [Browser Support](#browser-support)

## Installation

### Using NPM

Spritz was developed with a modern JavaScript workflow in mind. To use it, it's recommended you have a build system in place that can transpile ES6, and bundle modules.

```bash
$ npm install spritz.js --save
```

## Usage

Simply import Spritz, then instantiate it.

```javascript
// import Spritz
import Spritz from 'spritz.js'

// create an instance
const instance = Spritz({
	// Your options here
})

// basic usage: build & load the sprite
instance.init()
```

Options passed to the constructor are detailed below.

## Options

Settings overview list:

```javascript
Spritz({
	/* required parameters */
	src: 'path/to/sprite.jpg',
	width: 6470,
	height: 3096,
	steps: 18,
	rows: 4,

	/* optional parameters */
	container: '.selector',
	initial: 1,
	flip: false,
	responsive: false,
	mask: 'path/to/sprite-alpha.png',
	proxy: false
})
```    

Option details are detailed below.

### Src (required)

Specify the **path to your sprite**. Any format accepted (.jpg / .png / .gif).

> If you plan to use a **mask** for your sprite, we recommend to use a .jpg

```javascript
Spritz({
	src: 'path/to/sprite.jpg',
	// ...
})
```    

### Width (required)

Specify the full **width in pixels**, of your sprite source image.

```javascript
Spritz({
	width: 6470,
	// ...
})
```

### Height (required)

Specify the full **height in pixels**, of your sprite source image.

```javascript
Spritz({
	height: 3096,
	// ...
})
```

### Steps (required)

Define the **number of total steps / frames**, that your sprite includes. _Starting from 1_.

```javascript
Spritz({
	steps: 18,
	// ...
})
```

### Rows (required)

Define the **number of rows / lines**, that your sprite includes. _Starting from 1_.

```javascript
Spritz({
	rows: 4,
	// ...
})
```

### Container (optional, default: "body")

Specify the **container** to use for the sprite element.

**Default:** "body"

```javascript
Spritz({
	container: '.selector',
	// ...
})
```

### Initial (optional, default: 1)

Define the **initial step / frame** where to initiate the sprite.

**Default:** 1

```javascript
Spritz({
	initial: 3,
	// ...
})
```

### Flip (optional, default: false)

If set to true, the **sprite will be horizontaly mirrored**. For example, this allow you to reverse the orientation of a character sprite.

**Default:** false

```javascript
Spritz({
	flip: true,
	// ...
})
```

### Responsive (optional, default: false)

If set to true, instead of using its original sizes, the **sprite sizes will adapt to its container element**.

**Default:** false

```javascript
Spritz({
	responsive: true,
	// ...
})
```

### Mask (optional, default: false)

Specify a **path to a sprite mask image**. This is just a black and white image that represents the transparent areas, and will be used as alpha mask. 8-bit PNG format is recommended.

> **The mask image has to be the exact replica of your main sprite source.** It means same sizes, same steps, same rows, and same positioning.

**Default:** false

```javascript
Spritz({
	mask: 'path/to/sprite-alpha-mask.png',
	// ...
})
```

### Proxy (optional, default: false)

JSON object defining **HD replacement proxy images**. Keys will defines the step / frame number. Values will define the path to the image. 24-bit PNG with transparency is recommended, if the sprite require transparency.

If defined, the replacement will be triggered asynchronously, AFTER any step change.

> Each proxy image has to be the exact replica of the sprite step to replace.

**Default:** false

```javascript
Spritz({
	proxy: {
        1: 'path/to/proxy/hd-replacement-01.png',
        2: 'path/to/proxy/hd-replacement-02.png',
        3: 'path/to/proxy/hd-replacement-03.png',
        4: 'path/to/proxy/hd-replacement-04.png',
        // ...
    },
	// ...
})
```

## API / Events

Spritz exposes the following methods, and corresponding events:

* [init](#init)
* [load](#load)
* [build](#build)
* [destroy](#destroy)
* [changeStep](#changestep)
* [changeProgress](#changeprogress)
* [getCurrentStep](#getcurrentstep)
* [isMaskingSupported](#ismaskingsupported)

Note that **all methods, including those from the event emitter, are chainable**.

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

### .changeStep(step)

Used to _change the current active step of the sprite_.

**Parameters:**

* step (integer): step / frame number. Default: 1

```javascript
// change the current active step to 3
instance.changeStep(3)

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

Spritz is supported by **Evergreen Browsers** such as: IE 10+, Opera, Safari, Firefox & Chrome.

> NON-EVERGREEN BROWSERS SUPPORT IN PROGRESS

_It also supports the following natively_:

* IE 8+
* iOS Safari 7.1+
* Android Browser 4.4+

## License

[MIT](https://github.com/maoosi/spritz.js/blob/master/LICENSE.md) © 2016 Sylvain Simao

[![Built With Love](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)
