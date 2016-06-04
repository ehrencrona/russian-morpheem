/// <reference path="../../typings/express.d.ts"/>

import * as express from "express"
import 'source-map-support/register'
import readCorpus from './CorpusReader'
import { watchForChanges } from './CorpusReader'
import { getCorpusDir } from './CorpusReader'

import Sentence from '../shared/Sentence'
import InflectableWord from '../shared/InflectableWord'
import Word from '../shared/Word'
import Corpus from '../shared/Corpus'

import writeSentenceFile from '../backend/SentenceFileWriter'
import writeInflectionsFile from '../backend/InflectionsFileWriter'
import writeFactFile from '../backend/FactFileWriter'
import getInflections from './InflectionDatabase'
import NoSuchWordError from '../shared/NoSuchWordError'
import { generateInflection } from '../shared/FindBestInflection'

var app = express()
var bodyParser = require('body-parser')
var passport = require('passport')

var port = process.env.PORT || 8080

if (process.env.ENV != 'dev') {
    var jwt = require('express-jwt')

    var jwtCheck = jwt({
        secret: new Buffer('RVSvUvISdOTFLypEic_VLRZIB82wVwZH-ffK6FZRtv3F_V8BMgitGsv16Rjfvhub', 'base64'),
        audience: 'BcdEIFVbZCfkNbO1GlL7dqS2ghOIfHBk'
    })

    app.use('/api', jwtCheck)
}

var redis = require('node-redis')

let client = redis.createClient()

client.on('error', function (err) {
    console.log('Error ' + err);
})

app.use(bodyParser.json())

function getAuthor(req) {
    if (req.user && req.user.sub) {
        return req.user.sub.split('|')[1]
    }
}

function registerRoutes(corpus: Corpus) {
    let lang = corpus.lang
    let lastSave

    let corpusDir = getCorpusDir(corpus.lang)

    app.get(`/api/${lang}/corpus`, function(req, res) {
        res.status(200).send(corpus.toJson())
    })

    app.put(`/api/${lang}/fact/:pos/:id`, function(req, res) {
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

    app.post(`/api/${lang}/fact/:id`, function(req, res) {
        try {
            let components = req.params['id'].split('@')
            
            let fact = corpus.inflections.get(components[0]).getFact(components[1])

            corpus.facts.add(fact)
            
            console.log('Added ' + fact + '.')

            res.status(200).send({})
        }
        catch (e) {
            res.status(500).send(e)
            console.error(e.stack)
        }
    })
    
    app.put(`/api/${lang}/word/:word/inflection/:inflection`, (req, res) => {
        let wordId = req.params['word']
        let inflectionId = req.params['inflection']
        
        let inflection = corpus.inflections.get(inflectionId)
        
        if (!inflection) {
            throw new Error(`Could not find ${inflectionId}.`)
        }

        let word = corpus.facts.get(wordId)

        if (!word) {
            throw new Error(`Could not find ${wordId}.`)
        }

        if (word instanceof InflectableWord) {            
            corpus.words.changeInflection(word, inflection)
                
            console.log(`Changed inflection of ${word} to ${inflectionId}.`)
        }
        else {
            throw Error(word + ' is not inflected')
        }
    })

    app.post(`/api/${lang}/inflection-for/:word`, function(req, res) {
        try {
            let wordString = req.params['word']

            if (!wordString) {
                throw new Error('No word sent')
            }

            getInflections(wordString, client)
            .catch((e) => {
                if (e instanceof NoSuchWordError) {
                    res.status(404).send({
                        error: 'unknown'
                    })
                }
                else {
                    console.error(e.stack)
                    res.status(500).send(e)
                }
            })
            .then((gotInflections) => {
                // caught above
                if (!gotInflections) {
                    return
                }

                let forms = gotInflections.forms

                let generated = generateInflection(forms, gotInflections.pos, lang, corpus.inflections)
                let inflection = generated.inflection

                if (generated.isNew) {
                    corpus.inflections.add(inflection)
                }

                res.status(200).send({
                    isNew: generated.isNew,
                    id: generated.inflection.id,
                    inflection: generated.inflection.toJson(),
                    stem: generated.stem    
                })
            })
            .catch((e) => {
                console.log(e.stack)
                
                res.status(500).send({})
            })
        }
        catch (e) {
            res.status(500).send(e)
            console.error(e.stack)
        }
    })
    
    app.post(`/api/${lang}/word/:word`, function(req, res) {
        try {
            let wordString = req.params['word']

            if (!wordString) {
                throw new Error('No word sent')
            }

            let word = new Word(wordString)
            
            word.setEnglish('n/a')

            corpus.words.addWord(word)
            corpus.facts.add(word)

            console.log('Added word ' + word.getId())

            res.status(200).send({})
        }
        catch (e) {
            res.status(500).send(e)
            console.error(e.stack)
        }
    })
    
    app.post(`/api/${lang}/inflected-word/:stem`, function(req, res) {
        try {
            let stem = req.params['stem']

            if (!stem) {
                throw new Error('No stem sent')
            }
            
            let inflectionId = req.body.inflection
            let inflection = corpus.inflections.get(inflectionId)

            if (!inflection) {
                throw new Error(`Could not find ${inflectionId}.`)
            }

            let word = new InflectableWord(stem, inflection)    
            
            word.setEnglish('n/a')

            corpus.words.addInflectableWord(word)
            corpus.facts.add(word)

            console.log('Added word ' + word.getId() + ' with inflection ' + inflectionId)

            res.status(200).send({})
        }
        catch (e) {
            res.status(500).send(e)
            console.error(e.stack)
        }
    })
    
    app.post(`/api/${lang}/sentence`, function(req, res) {
        try {
            let sentence = Sentence.fromJson(req.body, corpus.facts, corpus.words)
            sentence.author = getAuthor(req)

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
    
    app.delete(`/api/${lang}/sentence/:id`, function(req, res) {
        try {
            corpus.sentences.remove(corpus.sentences.get(req.params['id']))

            res.status(200).send({ })
        }
        catch (e) {
            res.status(500).send(e)
            console.error(e.stack)
        }
    })

    app.put(`/api/${lang}/sentence/:id`, function(req, res) {
        try {
            let sentence = Sentence.fromJson(req.body, corpus.facts, corpus.words)
            sentence.author = getAuthor(req)

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
        lastSave = new Date().getTime()

        writeSentenceFile(corpusDir + '/sentences.txt', corpus.sentences, corpus.words)
        .catch((e) => console.error(e.stack))
    }

    function saveFacts() {
        lastSave = new Date().getTime()
        
        writeFactFile(corpusDir + '/facts.txt', corpus.facts)
        .catch((e) => console.error(e.stack))
    }

    function saveInflections() {
        lastSave = new Date().getTime()
        
        writeInflectionsFile(corpusDir + '/inflections.txt', corpus.inflections, lang)
        .catch((e) => console.error(e.stack))
    }

    corpus.sentences.onAdd = saveSentences
    corpus.sentences.onChange = saveSentences
    corpus.sentences.onDelete = saveSentences
    corpus.facts.onMove = saveFacts
    corpus.facts.onAdd = saveFacts
    corpus.words.onChangeInflection = saveFacts
    corpus.inflections.onAdd = saveInflections

    corpus.onChangeOnDisk = () => {
        let t = new Date().getTime()
        
        if (lastSave && t - lastSave < 5000) {
            return
        }

        setTimeout(() => {            
            readCorpus(lang, false).then((newCorpus: Corpus) => {
                console.log(`Reloaded corpus ${lang}.`);

                corpus.clone(newCorpus)
            })
            .catch((e) => {
                console.log(e)
            })
        }, 200)
    }
}

Promise.all([
    readCorpus('ru', true).catch((e) => {
        console.log(e.stack)

        let corpus = Corpus.createEmpty('ru')

        watchForChanges(corpus)

        return corpus
    }),
    readCorpus('lat', true)
]).then((corpora) => {
    app.use('/', express.static('public'));

    corpora.forEach(registerRoutes)
    
    app.listen(port)
}).catch((e) => {
    console.error(e)
})
