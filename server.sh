#!/bin/bash

supervisor -w build/shared -w build/backend build/backend/server.js
