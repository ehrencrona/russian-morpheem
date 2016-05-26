'use strict'

import readInflectionFile from './InflectionFileReader';
import readFactFile from './FactFileReader';
import SentenceFileReader from './SentenceFileReader';
import Facts from '../shared/Facts';
import Corpus from '../shared/Corpus';
import Words from '../shared/Words';
import Sentence from '../shared/Sentence';
import Sentences from '../shared/Sentences';
import Inflections from '../shared/Inflections';

export function getCorpusDir(lang) {
    return 'public/corpus/' + (lang == 'ru' ? 'russian' : 'latin') 
} 

export default function readCorpus(lang) {
    let corpusDir = getCorpusDir(lang)
    
    return readInflectionFile(corpusDir + '/inflections.txt', lang)
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
}