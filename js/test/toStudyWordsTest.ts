/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../shared/inflection/Inflections';
import Inflection from '../shared/inflection/Inflection';

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

    let inflection = new Inflection('regular', 'nom', '', 
            parseEndings('nom: , gen: а', 'ru', 'n').endings)

    let inflections = new Inflections([ inflection ])
    
    let u = new Word('у')
    let helovek = new InflectableWord('человек', inflection)
    let net = new Word('нет')
    let professor = new InflectableWord('профессор', inflection)

    let facts = new Facts()
        .add(u)
        .add(helovek)
        .add(net)
        .add(professor)

    let words = new Words(facts)

    let phrase = new Phrase('unet', [ 
        PhrasePattern.fromString('у@ gen нет@ gen', '[gen] does not have [gen]', words, inflections) 
    ])

    let phrases = new Phrases()

    let sentence = new Sentence([
        u, helovek.inflect('gen'), net, professor.inflect('gen')
    ], 0)

    sentence.phrases.push(phrase)

    let sentences = new Sentences()

    let corpus = new Corpus(inflections, words, sentences, facts, phrases, 'ru')

    it('works', () => {

        let studyWords = toStudyWords(sentence, phrase, corpus)

        expect(studyWords.length).to.equal(4)

        expect(studyWords[0] instanceof StudyPhrase).to.be.true
        expect(studyWords[2] instanceof StudyPhrase).to.be.true

        expect((studyWords[0] as StudyPhrase).en).to.equal('')
        expect((studyWords[2] as StudyPhrase).en).to.equal('does not have')

    })

})