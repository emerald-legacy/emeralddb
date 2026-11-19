#!/bin/bash -e

rm -rf dist

tsc --watch > /dev/null &

until [ -f dist/index.js ]; do sleep 1; done

nodemon --watch dist dist/index.js
