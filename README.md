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
* [ ] Animated transitions between steps

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

Define the **path to your sprite**. Any format accepted (.jpg / .png / .gif).

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

**Number of steps / frames**, that your sprite includes. _Starting from 1_.

```javascript
Spritz({
	steps: 18,
	// ...
})
```

### Rows (required)

**Number of rows / lines**, that your sprite includes. _Starting from 1_.

```javascript
Spritz({
	rows: 4,
	// ...
})
```

## API / Events

Spritz exposes the following methods, and corresponding events:

* [init](#init)
* [load](#load)
* [build](#build)
* [destroy](#destroy)
* [setStep](#setstep)
* [setProgress](#setprogress)
* [getStep](#getstep)
* [isMaskingSupported](#ismasksupported)

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
