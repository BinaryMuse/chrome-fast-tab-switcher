#!/usr/bin/env bash
./node_modules/.bin/coffee -c -b -w -o src/js/ src/coffee/background.coffee &
./node_modules/.bin/watchify -v -t coffeeify -o src/js/app.js src/coffee/app.coffee &

for job in `jobs -p`
do
  wait $job
done
