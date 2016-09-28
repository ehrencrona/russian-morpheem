'use strict'

import readInflectionsFile from './inflection/InflectionFileReader'
import readFactFile from './FactFileReader'
import { resolvePhrases } from '../shared/fact/FactFileParser'
import readPhraseFile from './PhraseFileReader'
import SentenceFileReader from './SentenceFileReader'
import Facts from '../shared/fact/Facts'
import Corpus from '../shared/Corpus'
import Words from '../shared/Words'
import Sentence from '../shared/Sentence'
import Sentences from '../shared/Sentences'
import Phrases from '../shared/phrase/Phrases'
import Inflections from '../shared/inflection/Inflections'
import { watch } from 'fs'
import BackendSentenceHistory from './metadata/BackendSentenceHistory'
import BackendPhraseHistory from './metadata/BackendPhraseHistory'
import BackendFactoids from './metadata/BackendFactoids'

export function getCorpusDir(lang) {
    return 'public/corpus/' + (lang == 'ru' ? 'russian' : 'latin') 
} 

export function watchForChangesOnDisk(corpus: Corpus) {
    let corpusDir = getCorpusDir(corpus.lang)
    let lastChange

    for (let file of [ 'inflections.txt', 'facts.txt', 'sentences.txt', 'phrases.txt' ]) {                            
        watch(corpusDir + '/' + file, (event, filename) => {
            let t = new Date().getTime()

            if (lastChange && t - lastChange < 2000) {
                return
            }

            lastChange = t

            if (corpus.onChangeOnDisk) {
                corpus.onChangeOnDisk()
            }
        })
    }
}

export default function readCorpus(lang, doWatch) {
    let corpusDir = getCorpusDir(lang)
    
    return readInflectionsFile(corpusDir + '/inflections.txt', lang)
    .then((inflections: Inflections) => {
        return readFactFile(corpusDir + '/facts.txt', inflections, lang)        
            .then((facts: Facts) => {
                console.log('read', facts.facts.length, 'facts in', lang)
                
                let words = new Words(facts)                
                words.addPunctuation()

                return readPhraseFile(corpusDir + '/phrases.txt', words, inflections, lang)
                    .then((phrases: Phrases) => {
                        resolvePhrases(facts, phrases)

                        return SentenceFileReader(corpusDir + '/sentences.txt', words, phrases)
                        .then((sentences: Sentences) => {
                            let corpus = new Corpus(inflections, words, sentences, facts, phrases, lang)

                            phrases.setCorpus(corpus)

                            return corpus
                        })
                    })
            })
    })
    .then((corpus: Corpus) => {
        corpus.sentenceHistory = new BackendSentenceHistory(corpus.words)
        corpus.phraseHistory = new BackendPhraseHistory()
        corpus.factoids = new BackendFactoids()

        if (doWatch) {
            watchForChangesOnDisk(corpus)
        }

        return corpus
    })
}