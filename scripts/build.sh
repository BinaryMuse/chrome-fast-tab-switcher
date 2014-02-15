#!/usr/bin/env bash
./node_modules/.bin/coffee -c -b -o src/js/ src/coffee/background.coffee
./node_modules/.bin/browserify -t coffeeify -o src/js/app.js src/coffee/app.coffee
