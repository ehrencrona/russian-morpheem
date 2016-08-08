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
    let verbInflection = new Inflection('verb', 'inf', 'v', 
            parseEndings('inf: ть, 3: ет', 'ru', 'n').endings)

    let inflection = new Inflection('regular', 'nom', 'n', 
            parseEndings('nom: , gen: а, dat: у, acc: а', 'ru', 'n').endings)

    let inflections = new Inflections([ inflection ])
    
    let u = new Word('у')
    let dat = new InflectableWord('да', verbInflection).setEnglish('give')
    let helovek = new InflectableWord('человек', inflection).setEnglish('person')
    let net = new Word('нет').setEnglish('not')
    let professor = new InflectableWord('профессор', inflection).setEnglish('professor')
    let podarok = new InflectableWord('подарок', inflection).setEnglish('gift')
    let on = new Word('он').setEnglish('he')

    let facts = new Facts()
        .add(u)
        .add(helovek)
        .add(net)
        .add(on)
        .add(podarok)
        .add(professor)

    let words = new Words(facts)

    let phrase = new Phrase('unet', [ 
        PhrasePattern.fromString('у@ gen нет@ gen', '[gen] does not have [gen]', words, inflections) 
    ])
    phrase.setCorpus(Corpus.createEmpty('ru'))

    let phrases = new Phrases()

    let sentence = new Sentence([
        u, helovek.inflect('gen'), net, professor.inflect('gen')
    ], 0)

    sentence.phrases.push(phrase)

    let sentences = new Sentences()

    let corpus = new Corpus(inflections, words, sentences, facts, phrases, 'ru')

    it('works', () => {

        let studyWords = toStudyWords(sentence, [ phrase ], corpus)

        expect(studyWords.length).to.equal(4)

        expect(studyWords[0] instanceof StudyPhrase).to.be.true
        expect(studyWords[2] instanceof StudyPhrase).to.be.true

        expect((studyWords[0] as StudyPhrase).en).to.equal('')
        expect((studyWords[2] as StudyPhrase).en).to.equal('does not have')

    })
    
    it('handles multiple cases', () => {
        let sentence = new Sentence([
            helovek.inflect('dat'), on, dat.inflect('3'), podarok.inflect('acc')
        ], 0)

        let pattern = PhrasePattern.fromString('@dative+ any verb@+ any @accusative+', 'to [someone] verb@+ [something]', words, inflections)
        
        let phrase = new Phrase('giveSomeoneSthg', [ pattern ])
        phrases.setCorpus(Corpus.createEmpty('ru'))

        let match = phrase.match(sentence.words, facts)

        sentence.phrases.push(phrase)

        expect(!!match).to.be.true

        let studyWords: StudyWord[] = toStudyWords(sentence, [phrase], corpus)

        expect(studyWords.length).to.equal(5)

        expect(studyWords[3].jp).to.equal('дает')
        expect(studyWords[3].getHint()).to.equal('give')
    })

    it('cant reproduce an error', () => {
        let sentence = new Sentence([
            on, dat.inflect('3'), helovek.inflect('dat'), podarok.inflect('acc')
        ], 0)

        let pattern = PhrasePattern.fromString('verb@+ @dative+ any @accusative+', 'verb@+ [someone] [something]', words, inflections)

        let phrase = new Phrase('giveSomeoneSthg', [ pattern ])
        phrases.setCorpus(Corpus.createEmpty('ru'))

        let match = phrase.match(sentence.words, facts)

        sentence.phrases.push(phrase)

        expect(!!match).to.be.true

        let studyWords: StudyWord[] = toStudyWords(sentence, [phrase], corpus)

        expect(studyWords.length).to.equal(4)
    })

    it('cant reproduce another error', () => {
        let sentence = new Sentence([
            helovek.inflect('dat'), on, podarok.inflect('acc'), net
        ], 0)

        let pattern = PhrasePattern.fromString('@dative+ он@ подарок@', '[someone] does do something', words, inflections)

        let phrase = new Phrase('giveSomeoneSthg', [ pattern ])
        phrases.setCorpus(Corpus.createEmpty('ru'))

        let match = phrase.match(sentence.words, facts)

        sentence.phrases.push(phrase)

        expect(!!match).to.be.true

        let studyWords: StudyWord[] = toStudyWords(sentence, [phrase], corpus)

        expect(studyWords.length).to.equal(3)
        expect(studyWords[0].jp).to.equal('человеку')
        expect(studyWords[1].jp).to.equal('он подарока')
        expect(studyWords[2].jp).to.equal('нет')
    })

})