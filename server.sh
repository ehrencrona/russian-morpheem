#!/bin/bash

supervisor -w build/shared,build/frontend build/backend/server.js
