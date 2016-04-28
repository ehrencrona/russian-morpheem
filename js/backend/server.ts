"use strict";

import * as express from "express"
import 'source-map-support/register'
import readCorpus from './CorpusReader'
import { corpusDir } from './CorpusReader'
import Sentence from '../shared/Sentence'
import writeSentenceFile from '../backend/SentenceFileWriter'
import writeFactFile from '../backend/FactFileWriter'

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

    app.put('/api/fact/:pos/:id', function(req, res) {
        try {
            let fact = corpus.facts.get(req.params['id'])
            let index = parseInt(req.params['pos'])
            
            corpus.facts.move(fact, index)

            console.log('Moved ' + fact + ' to ' + index)

            res.status(200).send({})
        }
        catch (e) {
            res.status(500).send(e)
            console.error(e.stack)
        }
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
    
    app.delete('/api/sentence/:id', function(req, res) {
        try {
            corpus.sentences.remove(corpus.sentences.get(req.params['id']))

            res.status(200).send({ })
        }
        catch (e) {
            res.status(500).send(e)
            console.error(e.stack)
        }
    })

    app.put('/api/sentence/:id', function(req, res) {
        try {            
            let sentence = Sentence.fromJson(req.body, corpus.facts, corpus.words)

            if (sentence.id != req.params['id']) {
                throw new Error('Inconsistent ID.');
            }

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
        .catch((e) => console.error(e.stack))
    }

    function saveFacts() {
        writeFactFile(corpusDir + '/facts.txt', corpus.facts)
        .catch((e) => console.error(e.stack))
    }

    corpus.sentences.onAdd = saveSentences
    corpus.sentences.onChange = saveSentences
    corpus.sentences.onDelete = saveSentences
    corpus.facts.onMove = saveFacts

    app.listen(port)
})
