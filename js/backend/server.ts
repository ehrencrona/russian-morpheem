"use strict";

import * as express from "express";

var app = express()

var port = process.env.PORT || 8080

import readCorpus from './CorpusReader';

readCorpus().then((corpus) => {    
    app.use('/', express.static('../../public'));

    app.get('/api/corpus', function(req, res) {
        res.status(200)
            .send(corpus.toJson())
    })

    app.listen(port)
})
