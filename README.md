# Spritz.js

> **TESTING IN PROGRESS** - **YET NOT PUBLISHED ON NPM AND JSDELIVR**

A small, modern, dependency-free, **sprites animation library**.

**Can be used for:** 360 viewers, products animation, interactive experiences, html5 games

## Features

* **Accessible** - full support for screen readers
* **Lightweight** - ~35KB minified
* **Responsive** - as you'd expect these days
* **[Compatible](#browser-support)** - IE8+ support, mobile support
* **[API / Events](#api--events)** - init, load, destroy, changeStep and more
* **No dependencies** - written in ES6 JavaScript, no jQuery required

Oh and yes, it is compatible with [ScrollMagic](http://scrollmagic.io).

## Work in progress

* [ ] Testing
* [ ] Accessibility support (WCAG 2.0, ARIA, screen readers)
* [ ] Publish on NPM
* [ ] Publish on JSDelivr
* [ ] Demo samples on Codepen
* [ ] Animated transitions between steps (incl. FPS and easing options)
* [ ] Debug mode with detailed console outputs
* [ ] Errors management
* [ ] Options: Mobile (enable / disable proxy for mobile devices), From (first step / frame to consider), To (last step / frame to consider)
* [ ] API / Events: Start (start loop animation), Stop (stop loop animation), Flip (flip the sprite), Range (change the current range of steps / frames to consider) ...

## Getting Started

1. [Installation](#installation)
2. [Usage](#usage)
3. [Options](#options)
4. [API / Events](#api--events)
5. [Browser Support](#browser-support)

## Installation

> **TESTING IN PROGRESS** - **YET NOT PUBLISHED ON NPM AND JSDELIVR**

### Using NPM 

```bash
$ npm install spritz.js --save
```

### jsDelivr CDN

```html
<script src="https://cdn.jsdelivr.net/spritz.js/1.0.0/spritz.min.js"></script>
```

## Usage

Spritz was developed with a **modern JavaScript workflow** in mind. To use it, it's recommended you have a build system in place that can transpile ES6, and bundle modules.

**If you don't have any ES6 workflow setup**, you can alternatively use the library in a more "classic" way, by including the minified version of the library into your project. For more details, please refer to the [Without ES6](#withoutes6) example below.

### ES6

Simply import `spritz.js`, then instantiate it.

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

### Without ES6

Simply include `spritz.min.js` into your project, then instantiate it. This can be done either by using the jsDelivr CDN, or by including it from the `dist` folder. 

```html
<!-- include spritz.min.js -->
<script src="path/to/spritz.min.js"></script>
```

```javascript
// create an instance
var instance = Spritz({
	// Your options here
})
	
// basic usage: build & load the sprite
instance.init()
```

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
Please refer to [Browser Support](#browser-support) section, for more information about masking support.

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
* [changeStep](#changestepstep)
* [changeProgress](#changeprogressprogressvalue)
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

> **TESTING IN PROGRESS** - **YET NOT COMPATIBLE WITH IE8**

Spritz is fully supported by **Evergreen Browsers** such as: IE 10+, Opera, Safari, Firefox & Chrome. Graceful degradation support has also been implemented on the following:

* IE 8+
* iOS Safari
* Android Browser

**Notes about support:**

* There is known issue with **Safari** and SVG's that makes rendering very slow. Thereby, masking is disabled for Safari.
* In order to limit data usage on **mobile devices**, proxy replacement has been disabled by default.
* **IE 8** uses render fallbacks and doens't support SVG's. (For SVG support on IE 8, you can include the following polyfill into your project: https://code.google.com/archive/p/svgweb/)

## License

[MIT](https://github.com/maoosi/spritz.js/blob/master/LICENSE.md) © 2016 Sylvain Simao

[![Built With Love](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)
