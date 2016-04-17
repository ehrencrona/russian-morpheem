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

    app.post('/api/sentence', function(req, res) {
        try {            
            let sentence = Sentence.fromJson(req.body, corpus.facts, corpus.words)

            sentence.id = null

            corpus.sentences.add(sentence)
            
            console.log('Added ' + sentence + ' (' + sentence.id + ')')
            
            res.status(200).send({ id: sentence.id })
        }
        catch (e) {
            res.status(500).send(e)
            console.error(e.stack)
        }
    })
    
    app.put('/api/sentence/:id', function(req, res) {
        try {            
            let sentence = Sentence.fromJson(req.body, corpus.facts, corpus.words)

            corpus.sentences.store(sentence)

            console.log('Stored ' + sentence + ' (' + sentence.id + ')')

            res.status(200).send({})
        }
        catch (e) {
            res.status(500).send(e)
            console.error(e.stack)
        }
    })

    function saveSentences() {
        writeSentenceFile(corpusDir + '/sentences.txt', corpus.sentences, corpus.words)
    }

    corpus.sentences.onAdd = saveSentences
    corpus.sentences.onChange = saveSentences

    app.listen(port)
})
