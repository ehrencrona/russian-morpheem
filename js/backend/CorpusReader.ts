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
import { watch } from 'fs';

export function getCorpusDir(lang) {
    return 'public/corpus/' + (lang == 'ru' ? 'russian' : 'latin') 
} 

export default function readCorpus(lang, doWatch) {
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
                    let result = new Corpus(inflections, words, sentences, facts, lang)
                    
                    if (doWatch) {
                        for (let file of [ 'inflections.txt', 'facts.txt', 'sentences.txt' ]) {                            
                            watch(corpusDir + '/' + file, (event, filename) => {
                                readCorpus(lang, false).then((newCorpus) => {
                                    console.log(`Reloaded corpus ${lang}.`);

                                    result.words = newCorpus.words
                                    result.facts = newCorpus.facts
                                    result.inflections = newCorpus.inflections
                                    result.sentences = newCorpus.sentences
                                })
                                .catch((e) => {
                                    console.log(e)
                                })
                            })
                        }
                    }
                    
                    return result
                })
            })
    })
}