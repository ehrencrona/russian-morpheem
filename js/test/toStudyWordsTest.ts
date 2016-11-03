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

import toStudyWords from '../shared/study/toStudyWords'
import StudyWord from '../shared/study/StudyWord'
import StudyPhrase from '../shared/study/StudyPhrase'

import { expect } from 'chai';

describe('toStudyWords', () => {
    let nounInflection = new Inflection('regular', 'nom', 'n', 
            parseEndings('nom , gen а, dat у, pl и, acc а, genpl ей', 'ru', 'n').endings)

    let inflections = new Inflections([ nounInflection ])
    
    let u = new Word('у')
    let lyudi = new InflectableWord('люд', nounInflection).setEnglish('people')
    let mashina = new InflectableWord('машин', nounInflection).setEnglish('car')
    let mnogo = new Word('много').setEnglish('much')

    let facts = new Facts()
        .add(u)
        .add(mnogo)
        .add(lyudi)
        .add(mashina)

    let words = new Words(facts)

    let phrases = new Phrases()

    let np = new Phrase('auto-np', [ 
        PhrasePattern.fromString('noun@nominative', '(1)', words, inflections), 
        PhrasePattern.fromString('phrase:много', '(1)', words, inflections) 
    ])
    phrases.add(np)

    let uPhrase = new Phrase('у', [ 
        PhrasePattern.fromString('у@ phrase:np@gen phrase:np@nom', '[someone] has [something]', words, inflections) 
    ])
    phrases.add(uPhrase)

    let mnogoPhrase = new Phrase('много', [ 
        PhrasePattern.fromString('много phrase:np@genitive', 'a lot of [something]', words, inflections) 
    ])
    phrases.add(mnogoPhrase)

    let sentences = new Sentences()

    let corpus = new Corpus(inflections, words, sentences, facts, phrases, 'ru')
    phrases.setCorpus(corpus)

    let sentence = new Sentence([
        u, mnogo, lyudi.inflect('genpl'), mashina.inflect('pl') 
    ], 0)
    sentence.addPhrase(uPhrase)
    sentence.addPhrase(mnogoPhrase)

    let genpl = nounInflection.getFact('genpl')

    it('studies inflections', () => {
        let tokens = toStudyWords(sentence, [ genpl ], corpus)

        expect(tokens[2].studied).to.be.true
        expect(tokens[0].studied).to.be.false
    })

    it('studies inflections', () => {
        let tokens = toStudyWords(sentence, [ mashina ], corpus)

        expect(tokens[3].studied).to.be.true
        expect(tokens[0].studied).to.be.false
    })

    it('studies embedded phrases', () => {
        let tokens = toStudyWords(sentence, [ mnogoPhrase ], corpus)
        let studyPhrase = tokens[1] as StudyPhrase

        expect(studyPhrase).to.be.instanceof(StudyPhrase)
        expect(studyPhrase.phrase.id).to.equal(mnogoPhrase.id)
        expect(studyPhrase.studied).to.be.true

        expect(studyPhrase.words.length).to.equal(2)
    })

    it.only('studies top-level phrases', () => {
        let tokens = toStudyWords(sentence, [ uPhrase ], corpus)
        let studyPhrase = tokens[0] as StudyPhrase

        expect(studyPhrase).to.be.instanceof(StudyPhrase)
        expect(studyPhrase.phrase.id).to.equal(uPhrase.id)
        expect(studyPhrase.studied).to.be.true

        expect(studyPhrase.words[1].hasFact(uPhrase)).to.be.true
        expect(studyPhrase.words[1].hasFact(mnogoPhrase)).to.be.true

        expect(studyPhrase.words.length).to.equal(4)
    })

    it('works with any', () => {
        let anyPhrase = new Phrase('много', [ 
            PhrasePattern.fromString('много any phrase:np@genitive', 'a lot of ... [something]', words, inflections) 
        ])
        anyPhrase.setCorpus(corpus)

        let tokens = toStudyWords(sentence, [ anyPhrase ], corpus)

        expect(tokens.length).to.equal(4)

        expect(tokens[1].getHint()).to.equal('a lot of')
        expect(tokens[2].getHint()).to.equal('people')
    })

    it('studies phrase cases', () => {
        let caseFact = mnogoPhrase.getCaseFact(GrammaticalCase.GEN)
        let tokens = toStudyWords(sentence, [ caseFact ], corpus)
        let studyPhrase = tokens[2] as StudyPhrase

        expect((tokens[1] as StudyWord).hasFact(caseFact)).to.be.false

        expect(studyPhrase).to.be.instanceof(StudyPhrase)
        expect(studyPhrase.studied).to.be.true

        expect(studyPhrase.words[0].hasFact(caseFact)).to.be.true

        expect(studyPhrase.words.length).to.equal(1)
    })

    it('attaches facts', () => {
        let tokens = toStudyWords(sentence, [ genpl ], corpus)

        let lyudiStudyWord = tokens[2] as StudyWord

        expect(lyudiStudyWord.hasFact(lyudi)).to.be.true
        expect(lyudiStudyWord.hasFact(genpl)).to.be.true
    })

})