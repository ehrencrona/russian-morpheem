"use strict";

import * as express from "express"
import 'source-map-support/register'
import readCorpus from './CorpusReader'
import { corpusDir } from './CorpusReader'
import Sentence from '../shared/Sentence'
import writeSentenceFile from '../backend/SentenceFileWriter'

var app = express()
var bodyParser = require('body-parser')

var port = process.env.PORT || 8080

app.use(bodyParser.json());

readCorpus().then((corpus) => {    
    app.use('/', express.static('public'));

    app.get('/api/corpus', function(req, res) {
        res.status(200)
            .send(corpus.toJson())
    })

    app.put('/api/sentence/:id', function(req, res) {
        let sentence = Sentence.fromJson(req.body, corpus.facts, corpus.words)

        corpus.sentences.store(sentence)

        writeSentenceFile(corpusDir + '/sentences.txt', corpus.sentences, corpus.words)
        
        res.status(200)
    })

    app.listen(port)
})
