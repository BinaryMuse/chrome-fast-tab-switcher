#!/usr/bin/env bash
./node_modules/.bin/browserify -o build/js/background-bundle.js src/js/background.js
./node_modules/.bin/browserify -t reactify -o build/js/client-bundle.js src/js/client.jsx
