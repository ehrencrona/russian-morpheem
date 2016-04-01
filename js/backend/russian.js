'use strict'

var InflectionFileReader = require('./InflectionFileReader')
var FactFileReader = require('./FactFileReader')
var FactOrder = require('../shared/FactOrder')
var SentenceFileReader = require('./SentenceFileReader')
var UnstudiedWord = require('../shared/UnstudiedWord')
var Grammar = require('../shared/Grammar')

var corpusDir = '../../public/corpus/russian'

InflectionFileReader(corpusDir + '/inflections.txt').then(
    (inflections) => {
        let inflectionsById = {}
        
        for (let inflection of inflections) {
            inflectionsById[inflection.id] = inflection
        }

        let getInflection = (id) => {
            return inflectionsById[id]
        }

        let grammarById = {} 

        for (let inflection of inflections) {
            inflection.visitFacts((fact) => {
                grammarById[fact.getId()] = fact;
            });
        }
        
        let getGrammar = (id) => {
            return grammarById[id];
        }
           
        FactFileReader(corpusDir + '/facts.txt', getGrammar, getInflection).then(
            (facts) => {
                let wordsById = {}
                let ambiguousForms = {}

                wordsById['?'] = new UnstudiedWord('?', '?')
                wordsById['"WhatsApp"'] = new UnstudiedWord('WhatsApp')

                for (let word of facts) {
                    if (word instanceof Grammar) {
                        continue;
                    }
                    
                    if (word.visitAllInflections) {
                        word.visitAllInflections(
                            (inflectedWord) => {
                                let str = inflectedWord.toString();
                                
                                if (!ambiguousForms[str]) {
                                    if (wordsById[str]) {
                                        ambiguousForms[str] = true
                                        delete wordsById[str]
                                    }
                                    else {
                                        wordsById[str] = inflectedWord;
                                    }
                                }

                                wordsById[inflectedWord.toFormString(true)] = inflectedWord; 
                                wordsById[inflectedWord.toFormString(false)] = inflectedWord; 
                            })
                    }
                    else {
                        if (wordsById[word.toString()]) {
                            throw new Error('Duplicate word ' + word + '.');
                        }

                        wordsById[word.toString()] = word;
                    }
                }

                return SentenceFileReader(corpusDir + '/sentences.txt', wordsById, getGrammar).then(
                    (sentences) => {
                        console.log(sentences.length + ' sentences')

                        new FactOrder(facts).evaluateConsistency(sentences);
                    }
                )
            })
            .catch((e) => {
                console.log(e.stack);
            });
    })
    .catch((e) => {
        console.log(e);
    })
