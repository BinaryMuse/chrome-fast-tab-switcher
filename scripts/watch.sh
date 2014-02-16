#!/usr/bin/env bash
./node_modules/.bin/watchify -v -o build/js/background-bundle.js src/js/background.js &
./node_modules/.bin/watchify -v -t reactify -o build/js/client-bundle.js src/js/client.jsx &


for job in `jobs -p`
do
  wait $job
done
