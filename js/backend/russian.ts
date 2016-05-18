'use strict'

import readInflectionFile from './InflectionFileReader';
import readFactFile from './FactFileReader';
import FactOrder from '../shared/FactOrder';
import SentenceFileReader from './SentenceFileReader';
import UnstudiedWord from '../shared/UnstudiedWord';
import Grammar from '../shared/Grammar';
import Fact from '../shared/Fact';
import Facts from '../shared/Facts';
import Word from '../shared/Word';
import Words from '../shared/Words';
import Sentence from '../shared/Sentence';
import Sentences from '../shared/Sentences';
import Inflection from '../shared/Inflection';
import Inflections from '../shared/Inflections';
import InflectedWord from '../shared/InflectedWord';

var corpusDir = '../../public/corpus/russian'

readInflectionFile(corpusDir + '/inflections.txt').then(
    (inflections: Inflections) => {
        readFactFile(corpusDir + '/facts.txt', inflections).then(
            (facts: Facts) => {
                let words = new Words(facts);                

                words.add(new UnstudiedWord('?', null))
                words.add(new UnstudiedWord('"WhatsApp"', null))

                return SentenceFileReader(corpusDir + '/sentences.txt', words, facts).then(
                    (sentences: Sentences) => {
                        console.log(sentences.sentences.length + ' sentences')

                        sentences.sentences.forEach((sentence) => {
                            console.log(sentence.toJson());
                        })

//                      new FactOrder(facts).evaluateConsistency(sentences);
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
