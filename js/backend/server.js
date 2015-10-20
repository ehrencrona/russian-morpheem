"use strict";

var express = require('express')

var app = express()

var port = process.env.PORT || 8080

const ONE_DAY = 24 * 3600 * 1000


function isProd() {
    if (typeof process != 'undefined' && process.env.MORPHEEM_ENV === 'prod') {
        return true
    }
}

app.use(express.static(__dirname + '/../../' + (isProd() ? 'dist' : 'public'), { maxAge: ONE_DAY }))

if (!isProd()) {
    app.use('/bower_components', express.static(__dirname + '/../../bower_components'))
}



// Respond to the App Engine health check
app.get('/_ah/health', function(req, res) {
    res.status(200)
        .set('Content-Type', 'text/plain')
        .send('ok')
})

app.listen(port)

if (!isProd()) {
    var livereload = require('livereload')
    var server = livereload.createServer()

    server.watch(__dirname + '/../../public/directives')
    server.watch(__dirname + '/../../public/stylesheets')
    server.watch(__dirname + '/../../public/img')
    server.watch(__dirname + '/../../public/build')
    server.watch(__dirname + '/../../public')
}
