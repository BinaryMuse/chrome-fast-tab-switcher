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

First, install CoffeeScript with `npm install coffee-script` (requires Node.js).

The files in `src/js` are compiled from the CoffeeScript files in `src/coffee`. To build the project, run `./build.sh`; you can run `./watch.sh` to start a process that will continually compile the files as you make changes.
