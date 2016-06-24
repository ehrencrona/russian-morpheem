/// <reference path="../../typings/express.d.ts"/>

import * as express from "express"
import 'source-map-support/register'
import { watchForChangesOnDisk } from './CorpusReader'
import readCorpus from './CorpusReader'

import listenForChanges from './listenForChanges'
import Sentence from '../shared/Sentence'
import InflectableWord from '../shared/InflectableWord'
import Word from '../shared/Word'
import Corpus from '../shared/Corpus'

import NoSuchWordError from '../shared/NoSuchWordError'
import { generateInflection } from '../shared/GenerateInflection'

import addFact from './route/addFact';
import setFact from './route/setFact';
import setInflection from './route/setInflection';
import inflectionFor from './route/inflectionFor';
import addWord from './route/addWord';
import addInflectedWord from './route/addInflectedWord';
import addSentence from './route/addSentence';
import addComment from './route/addComment';
import deleteSentence from './route/deleteSentence';
import setSentence from './route/setSentence';
import getEvents from './route/getEvents';
import getStatus from './route/getStatus';
import setStatus from './route/setStatus';
import getPendingSentences from './route/getPendingSentences';
import getLatestEvents from './route/getLatestEvents';
import getMyLatestEvents from './route/getMyLatestEvents';
import getSentencesByDate from './route/sentencesByDate';
import getNewsfeed from './route/getNewsfeed';
import getExternalSentences from './route/getExternalSentences';
import importExternalSentence from './route/importExternalSentence';

import { tag, untag } from './route/tag';

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

app.use(bodyParser.json())

app.use('/api', (req, res, next) => {
    try {
        next()
    }
    catch (e) {
        res.status(500).send(e)
        console.error(e.stack)
    }
})

function registerRoutes(corpus: Corpus) {
    let lang = corpus.lang

    app.get(`/api/${lang}/corpus`, function(req, res) {
        res.status(200).send(corpus.toJson())
    })

    app.put(`/api/${lang}/fact/:pos/:id`, setFact(corpus))

    app.post(`/api/${lang}/fact/:id`, addFact(corpus))
    
    app.get(`/api/${lang}/fact/:fact/external`, getExternalSentences(corpus))

    app.put(`/api/${lang}/word/:word/inflection/:inflection`, setInflection(corpus))

    app.post(`/api/${lang}/inflection-for/:word`, inflectionFor(corpus))
    
    app.post(`/api/${lang}/word/:word`, addWord(corpus))
    
    app.post(`/api/${lang}/inflected-word/:stem`, addInflectedWord(corpus))
    
    app.post(`/api/${lang}/sentence`, addSentence(corpus))
    
    app.delete(`/api/${lang}/sentence/:id`, deleteSentence(corpus))

    app.put(`/api/${lang}/sentence/:id`, setSentence(corpus))

    app.get(`/api/${lang}/sentence/:id/events`, getEvents(corpus))

    app.post(`/api/${lang}/sentence/external/:source/:externalid`, importExternalSentence(corpus))
        
    app.post(`/api/${lang}/sentence/:id/comment`, addComment(corpus))

    app.get(`/api/${lang}/sentence/:id/status`, getStatus(corpus))

    app.put(`/api/${lang}/sentence/:id/status`, setStatus(corpus))

    app.post(`/api/${lang}/fact/:id/tag/:tag`, tag(corpus))

    app.post(`/api/${lang}/fact/:id/tag/:tag`, untag(corpus))

    app.get(`/api/${lang}/sentence/pending`, getPendingSentences(corpus))    
    
    app.get(`/api/${lang}/event/latest/my/:type`, getMyLatestEvents(corpus))

    app.get(`/api/${lang}/event/latest/my`, getMyLatestEvents(corpus))

    app.get(`/api/${lang}/event/latest/:author/:type`, getLatestEvents(corpus))    

    app.get(`/api/${lang}/event/latest`, getLatestEvents(corpus))    

    app.get(`/api/${lang}/event/newsfeed`, getNewsfeed(corpus))    

    app.get(`/api/${lang}/sentence/by-date`, getSentencesByDate(corpus))    
        
}

Promise.all([
    readCorpus('ru', true).catch((e) => {
        console.log(e.stack)

        let corpus = Corpus.createEmpty('ru')

        watchForChangesOnDisk(corpus)

        return corpus
    }),
    readCorpus('lat', true)
]).then((corpora) => {
    app.use('/', express.static('public'));

    corpora.forEach(listenForChanges)
    corpora.forEach(registerRoutes)

    app.listen(port)
}).catch((e) => {
    console.error(e)
})
