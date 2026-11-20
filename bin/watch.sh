#!/bin/bash -e

rm -rf dist

tsc --watch > /dev/null &
TSC_PID=$!
# Background jobs of a script ignore Ctrl+C, so tsc would outlive nodemon and keep
# concurrently/yarn waiting. Stop it whenever this script ends; the signal traps
# make sure the EXIT trap also runs on Ctrl+C, kill and a closed terminal.
trap 'kill $TSC_PID 2>/dev/null' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP

until [ -f dist/index.js ]; do sleep 1; done

nodemon --watch dist dist/index.js
