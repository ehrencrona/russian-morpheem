#!/bin/bash

rm -rf build/*
cd js
tsc -w --outDir ../build --jsx react -t ES6 -m umd --sourceMap  
