#!/bin/bash

supervisor -w build/shared,build/backend build/backend/server.js
