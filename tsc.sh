#!/bin/bash

rm -rf build/*
cd js
tsc -w **/*.ts* --outDir ../build --jsx react -t ES6 -m umd --sourceMap  
