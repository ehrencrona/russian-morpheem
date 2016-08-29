/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../shared/inflection/Inflections';
import Inflection from '../shared/inflection/Inflection';
import { GrammaticalCase } from '../shared/inflection/InflectionForms';

import Facts from '../shared/fact/Facts';
import Words from '../shared/Words';
import Corpus from '../shared/Corpus';
import Sentences from '../shared/Sentences';
import Sentence from '../shared/Sentence';
import Word from '../shared/Word';
import Phrase from '../shared/phrase/Phrase';
import Phrases from '../shared/phrase/Phrases';
import PhrasePattern from '../shared/phrase/PhrasePattern';
import InflectableWord from '../shared/InflectableWord';

import { parseEndings } from '../shared/inflection/InflectionsFileParser'

import toStudyWords from '../frontend/study/toStudyWords'
import StudyWord from '../frontend/study/StudyWord'
import StudyPhrase from '../frontend/study/StudyPhrase'

import { expect } from 'chai';

describe('toStudyWordsTest', () => {
    let nounInflection = new Inflection('regular', 'nom', 'n', 
            parseEndings('nom , gen а, dat у, pl и, acc а, genpl ей', 'ru', 'n').endings)

    let inflections = new Inflections([ nounInflection ])
    
    let u = new Word('у')
    let lyudi = new InflectableWord('люд', nounInflection).setEnglish('people')
    let mashina = new InflectableWord('машин', nounInflection).setEnglish('car')
    let mnogo = new Word('много').setEnglish('much')

    let facts = new Facts()
        .add(u)
        .add(lyudi)
        .add(mnogo)
        .add(mashina)

    let words = new Words(facts)

    let phrases = new Phrases()
    let sentences = new Sentences()
    let corpus = new Corpus(inflections, words, sentences, facts, phrases, 'ru')

    let np = new Phrase('np', [ 
        PhrasePattern.fromString('noun', '(1)', words, inflections), 
        PhrasePattern.fromString('phrase:много', '(1)', words, inflections) 
    ])
    phrases.add(np)

    let uPhrase = new Phrase('у', [ 
        PhrasePattern.fromString('у@ phrase:np@gen phrase:np@nom', '[someone] has [something]', words, inflections) 
    ])
    phrases.add(uPhrase)

    let mnogoPhrase = new Phrase('много', [ 
        PhrasePattern.fromString('много phrase:np@gen', 'a lot of [something]', words, inflections) 
    ])
    phrases.add(mnogoPhrase)

    phrases.setCorpus(Corpus.createEmpty('ru'))

    let sentence = new Sentence([
        u, mnogo, lyudi.inflect('genpl'), mashina.inflect('pl') 
    ], 0)

    it('studies inflections', () => {
        let tokens = toStudyWords(sentence, [ nounInflection.getFact('genpl') ], corpus)

        expect(tokens[2].studied).to.be.true
        expect(tokens[0].studied).to.be.false
    })

})