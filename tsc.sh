#!/bin/bash

rm -rf build/*
cd js
tsc **/*.ts* --outDir ../build --jsx react -t ES6 -m umd --sourceMap  
