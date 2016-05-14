"use strict";

import * as express from "express"
import 'source-map-support/register'
import readCorpus from './CorpusReader'
import { corpusDir } from './CorpusReader'
import Sentence from '../shared/Sentence'
import InflectedWord from '../shared/InflectedWord'
import Word from '../shared/Word'
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

    app.put('/api/word/:word/inflection/:inflection', (req, res) => {
        let wordString = req.params['word']
        let inflectionId = req.params['inflection']
        
        let word = corpus.words.get(wordString)
        
        if (word instanceof InflectedWord) {            
            corpus.words.changeInflection(word, 
                corpus.inflections.get(inflectionId))
                
            console.log(`Changed inflection of ${word} to ${inflectionId}.`)
        }
        else {
            throw Error(word + ' is not inflected')
        }
    })

    app.post('/api/word/:word', function(req, res) {
        try {
            let wordString = req.params['word']

            if (!wordString) {
                throw new Error('No word sent')
            }

            let inflection = corpus.inflections.get(req.body.inflection)
            let word: Word

            if (inflection) {
                let defaultEnding = inflection.getEnding(inflection.defaultForm)
                
                if (wordString.substr(wordString.length - defaultEnding.length) != defaultEnding) {
                    throw new Error('Wrong ending.')
                } 

                let stem = wordString.substr(0, wordString.length - defaultEnding.length)
                
                word = new InflectedWord(wordString, null, 
                    inflection.defaultForm).setInflection(inflection)    
            }
            else {
                word = new Word(wordString)
            }
            
            word.setEnglish('n/a', '')

            corpus.words.add(word)
            corpus.facts.add(word)

            console.log('Added word ' + word.getId())

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
    corpus.facts.onAdd = saveFacts
    corpus.words.onChangeInflection = saveFacts
    
    app.listen(port)
})
