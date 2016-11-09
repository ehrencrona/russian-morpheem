/// <reference path="../../typings/express.d.ts"/>
/// <reference path="../../typings/index.d.ts" />

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

import getSitemap from './route/getSitemap'
import getGuide from './route/getGuide'
import getGuideSentence from './route/getGuideSentence'
import addFact from './route/addFact'
import deleteFact from './route/deleteFact'
import setFact from './route/setFact'
import inflectionFor from './route/inflectionFor'
import addWord from './route/addWord'
import setWord from './route/setWord'
import addInflectedWord from './route/addInflectedWord'
import addSentence from './route/addSentence'
import addComment from './route/addComment'
import deleteSentence from './route/deleteSentence'
import setSentence from './route/setSentence'
import setAudio from './route/setAudio'
import getAudio from './route/getAudio'
import setPhrase from './route/setPhrase'
import getEvents from './route/getEvents'
import getStatus from './route/getStatus'
import setStatus from './route/setStatus'
import getFactoids from './route/getFactoids'
import setFactoid from './route/setFactoid'
import getTopics from './route/getTopics'
import setTopic from './route/setTopic'
import getOpenPhrases from './route/getOpenPhrases'
import getPhraseStatus from './route/getPhraseStatus'
import setPhraseStatus from './route/setPhraseStatus'
import getPendingSentences from './route/getPendingSentences'
import getUnrecordedSentences from './route/getUnrecordedSentences'
import getLatestEvents from './route/getLatestEvents'
import getMyLatestEvents from './route/getMyLatestEvents'
import getEventsByDate from './route/eventsByDate'
import getNewsfeed from './route/getNewsfeed'
import getExternalSentences from './route/getExternalSentences'
import importExternalSentence from './route/importExternalSentence'
import getTranslation from './route/getTranslation'
import getProfile from './route/getProfile'
import setPlan from './route/setPlan'
import addQueuedFact from './route/addQueuedFact'

import registerExposures from './route/registerExposures'
import getExposures from './route/getExposures'

import { tag, untag } from './route/tag';

var app = express()
var bodyParser = require('body-parser')
var passport = require('passport')
var busboy = require('connect-busboy')

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
app.use(busboy())

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

    app.get(`/public-api/${lang}/corpus`, function(req, res) {
        res.contentType('application/json')
        res.status(200).json(corpus.toJson())
    })

    app.put(`/api/${lang}/fact/:pos/:id`, setFact(corpus))

    app.post(`/api/${lang}/fact/:id`, addFact(corpus))
    
    app.delete(`/api/${lang}/fact/:id`, deleteFact(corpus))

    app.get(`/api/${lang}/fact/:fact/external`, getExternalSentences(corpus))

    app.post(`/api/${lang}/inflection-for/:word`, inflectionFor(corpus))
    
    app.post(`/api/${lang}/word/:word`, addWord(corpus))

    app.put(`/api/${lang}/word/:word`, setWord(corpus))
    
    app.post(`/api/${lang}/inflected-word/:stem`, addInflectedWord(corpus))
    
    app.post(`/api/${lang}/sentence`, addSentence(corpus))
    
    app.delete(`/api/${lang}/sentence/:id`, deleteSentence(corpus))

    app.post(`/api/${lang}/sentence/:id/audio`, setAudio(corpus))    

    app.get(`/public-api/${lang}/sentence/:id/audio.wav`, getAudio(corpus))    

    app.put(`/api/${lang}/sentence/:id`, setSentence(corpus))

    app.get(`/api/${lang}/sentence/:id/events`, getEvents(corpus))

    app.put(`/api/${lang}/factoid/:id`, setFactoid(corpus))

    app.get(`/public-api/${lang}/factoid`, getFactoids(corpus))

    app.put(`/api/${lang}/topic/:id`, setTopic(corpus))

    app.get(`/api/${lang}/topic`, getTopics(corpus))

    app.post(`/api/${lang}/sentence/external/:source/:externalid`, importExternalSentence(corpus))
        
    app.post(`/api/${lang}/sentence/:id/comment`, addComment(corpus))

    app.get(`/api/${lang}/sentence/:id/status`, getStatus(corpus))

    app.put(`/api/${lang}/sentence/:id/status`, setStatus(corpus))

    app.get(`/api/${lang}/phrase/open`, getOpenPhrases(corpus))

    app.get(`/api/${lang}/phrase/:id/status`, getPhraseStatus(corpus))

    app.put(`/api/${lang}/phrase/:id/status`, setPhraseStatus(corpus))

    app.put(`/api/${lang}/phrase/:id`, setPhrase(corpus))

    app.post(`/api/${lang}/fact/:id/tag/:tag`, tag(corpus))

    app.delete(`/api/${lang}/fact/:id/tag/:tag`, untag(corpus))

    app.get(`/api/${lang}/sentence/pending`, getPendingSentences(corpus))    

    app.get(`/api/${lang}/sentence/unrecorded`, getUnrecordedSentences(corpus))    
    
    app.get(`/api/${lang}/event/latest/my/:type`, getMyLatestEvents(corpus))

    app.get(`/api/${lang}/event/latest/my`, getMyLatestEvents(corpus))

    app.get(`/api/${lang}/event/latest/:author/:type`, getLatestEvents(corpus))    

    app.get(`/api/${lang}/event/latest`, getLatestEvents(corpus))    

    app.get(`/api/${lang}/event/newsfeed`, getNewsfeed(corpus))    

    app.get(`/api/${lang}/event/by-date/:eventType`, getEventsByDate(corpus))    

    app.post(`/api/${lang}/exposure`, registerExposures(corpus))    

    app.get(`/api/${lang}/exposure`, getExposures(corpus))    

    app.get(`/api/user/profile`, getProfile(corpus))    

    app.put(`/api/user/plan`, setPlan(corpus))    

    app.post(`/api/user/profile/queued-fact`, addQueuedFact(corpus))    

    app.get(`/api/translate`, getTranslation(corpus))    

    app.get(`/word/:fact`, getGuide(corpus))    
    app.get(`/phrase/:fact`, getGuide(corpus))    
    app.get(`/form/:fact`, getGuide(corpus))    

    app.get(`/sentence/:sentence`, getGuideSentence(corpus))    

    app.get(`/sitemap.xml`, getSitemap(corpus))    

    app.get(`/`, (req, res) => 
        res.redirect('/form/nominative'))    
}

function triggerLivereload() {
    var livereload = require('livereload');
    var lrserver = livereload.createServer();

    let waitForConnect = () => {
        if (lrserver.server.clients.length) {
            lrserver.refresh('/js/app.js')
        }
        else {
            setTimeout(waitForConnect, 1000)
        }
    }

    waitForConnect()
}

readCorpus('ru', true).catch((e) => {
    console.log(e.stack)

    let corpus = Corpus.createEmpty('ru')

    watchForChangesOnDisk(corpus)

    return corpus
}).then((corpus) => {
    listenForChanges(corpus)
    registerRoutes(corpus)

    app.use('/', express.static('public'));

    app.listen(port)

    if (process.env['ENV'] == 'dev') {
//        triggerLivereload()
    }
}).catch((e) => {
    console.error(e)
})
