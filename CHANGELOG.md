# Changelog


## v2.2.2

- Dependencies update


## v2.2.1

- Package published to Yarn
- Travis CI


## v2.2.0

- Change: `new Spritz().init()` combined into `Spritz()`.
- Bug fix: `.until()` was stoping the animation a step too early.
- New option `init`: Specifies if the sprite should be automatically initiated.
- Dev workflow moved from `Gulp` to `Rollup`.
- Added `CHANGELOG.md`.
- Dependency update: `wait.js@3.0.0`
- Dependency update: `knot.js@1.1.5`
- Documentation enhancement
- Unit testing with Jest


## v2.1.0

- Bug fix: sprite wrapper is now `position`:relative;`
- Bug fix: this access after the sprite has been destroyed
- Option objectFit moved to picture level


## v2.0.5

- Position bug fix


## v2.0.3

- Bug fix: blurry sprites
- Bug fix: calculation problems for certain sprites size
- New option objectFit: Specifies how the sprite should be fitted to the parent. Values: `contain` or `cover`


## v2.0.2

- Bug fix: stop() not stoping animations correctly
- Bug fix: blurry sprites


## v2.0.1

- Alternative way to play an animation backward using `.play('backward')`.
- Some `console.log()` removed.
- Solved bug: missing parameters for Events.


## v2.0.0

For this new version, the library has been completely rewritten from scratch. This means that version 2.x is not compatible with the version 1.x.

**Why rewriting everything from scratch?**

In order to propose better performances and support (by using a Canvas drawing approach instead of CSS only), images responsivity (by using a syntax close to the new HTML5 "picture" element), and more flexibility for designing animations (through a chainable API with timers).


## v1.0.0

- First release
