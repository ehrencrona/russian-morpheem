#!/bin/bash

rm -rf build/*
cd js
tsc -w **/*.ts* -w backend/tools/*.ts --outDir ../build --jsx react -t ES6 -m umd --sourceMap  
