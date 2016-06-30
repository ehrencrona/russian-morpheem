'use strict'

import readInflectionsFile from './InflectionsFileReader';
import readFactFile from './FactFileReader';
import SentenceFileReader from './SentenceFileReader';
import Facts from '../shared/fact/Facts';
import Corpus from '../shared/Corpus';
import Words from '../shared/Words';
import Sentence from '../shared/Sentence';
import Sentences from '../shared/Sentences';
import Inflections from '../shared/Inflections';
import { watch } from 'fs';
import BackendSentenceHistory from './metadata/BackendSentenceHistory';

export function getCorpusDir(lang) {
    return 'public/corpus/' + (lang == 'ru' ? 'russian' : 'latin') 
} 

export function watchForChangesOnDisk(corpus: Corpus) {
    let corpusDir = getCorpusDir(corpus.lang)
    let lastChange

    for (let file of [ 'inflections.txt', 'facts.txt', 'sentences.txt' ]) {                            
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

                return SentenceFileReader(corpusDir + '/sentences.txt', words, facts)
                .then((sentences: Sentences) => {
                    return new Corpus(inflections, words, sentences, facts, lang)
                })
            })
    })
    .then((corpus: Corpus) => {
        corpus.sentenceHistory = new BackendSentenceHistory(corpus.words)

        if (doWatch) {
            watchForChangesOnDisk(corpus)
        }

        return corpus
    })
}