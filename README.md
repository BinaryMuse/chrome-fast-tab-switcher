Chrome Fast Tab Switcher
========================

This Chrome extension allows you to switch between Chrome tabs in your active window quickly using your keyboard.

Installation
------------

 * Visit `chrome://extensions/`
 * Ensure `Developer mode` is checked
 * Click `Load unpacked extension...`
 * Locate and select the directory with the `manifest.json` file in it

Usage
-----

The default keyboard shortcut is `Alt+Shift+T` (`Opt+Shift+T` on OS X). You can, and may need to, adjust your keyboard shortcuts via the link at the very bottom of your Chrome extensions page at `chrome://extensions`.

Hacking
-------

You must have [Node.js](http://nodejs.org/) installed to build the extension.

1. Install the dependencies: `npm install`
2. Build the extension from `src/js` into `build/js`:
  * Build once: `npm run build`
  * Build continuously as files change: `npm run watch`

Tests
-----

Run the test suite with `npm test`.

You may run JSHint on the source with `npm run jshint`.
