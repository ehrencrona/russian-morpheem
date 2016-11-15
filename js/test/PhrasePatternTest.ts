import { WordForm } from '../shared/inflection/WordForm';
/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../shared/inflection/Inflections';
import Inflection from '../shared/inflection/Inflection';
import { GrammarCase, PartOfSpeech as PoS } from '../shared/inflection/Dimensions'

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

describe('PhrasePatterns', () => {
    let nounInflection = new Inflection('regular', 'nom', new WordForm({ pos: PoS.NOUN }), 
            parseEndings('nom , gen а, dat у, pl и, acc а, datpl ей, genpl ей', 'ru', PoS.NOUN).endings)

    let inflections = new Inflections([ nounInflection ])
    
    let u = new Word('у')
    let lyudi = new InflectableWord('люд', nounInflection).setEnglish('people')
    let mashina = new InflectableWord('машин', nounInflection).setEnglish('car').setEnglish('cars', 'pl')
    let mnogo = new Word('много').setEnglish('much')
    let net = new Word('нет')
    let dwa = new Word('два').setEnglish('two')

    let facts = new Facts()
        .add(u)
        .add(mnogo)
        .add(lyudi)
        .add(mashina)
        .add(net)
        .add(dwa)

    let words = new Words(facts)

    let phrases = new Phrases()

    let np = new Phrase('auto-np', [ 
        PhrasePattern.fromString('noun@context', '(article) (1)', words, inflections), 
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

    it('translates', () => {
        let m = mnogoPhrase.match({
            sentence: sentence,
            words: sentence.words,
            facts: facts
        })

        expect(m).to.not.be.undefined

        expect(m.pattern.getEnglishFragments().length).to.equal(1)
        expect(m.pattern.getEnglishFragments()[0].en(m)).to.equal('a lot of people')
    })

    it('matches context phrases even without context', () => {
        let m = np.match({
            sentence: sentence,
            words: sentence.words,
            facts: facts
        })

        expect(m).to.not.be.undefined
    })

    it('translates embedded phrases', () => {
        let m = uPhrase.match({
            sentence: sentence,
            words: sentence.words,
            facts: facts
        })

        expect(m).to.not.be.undefined

        expect(m.pattern.getEnglishFragments().length).to.equal(1)
        expect(m.pattern.getEnglishFragments()[0].en(m)).to.equal('a lot of people has cars')
    })

    it('translates articles', () => {
        sentence.setEnglish('some of the people have cars')

        let m = uPhrase.match({
            sentence: sentence,
            words: sentence.words,
            facts: facts
        })

        expect(m.pattern.getEnglishFragments()[0].en(m)).to.equal('a lot of the people has cars')
    })

    it('handles explicitly listed inflections', () => {
        let netPhrase = new Phrase('нужно', [ 
            PhrasePattern.fromString(
                'нет@ @genitive+', 
                '(there is no,pl:there are no,2->v) [something]',
                words, inflections) 
        ])
        phrases.add(netPhrase)

        let sentence = new Sentence([
            net, mashina.inflect('genpl'), 
        ], 0)

        let m = netPhrase.match({
            sentence: sentence,
            words: sentence.words,
            facts: facts
        })

        expect(m).to.not.be.undefined

        expect(m.pattern.getEnglishFragments()[0].en(m)).to.equal('there are no cars')

        sentence = new Sentence([
            net, mashina.inflect('gen'),  
        ], 0)

        m = netPhrase.match({
            sentence: sentence,
            words: sentence.words,
            facts: facts
        })

        expect(m).to.not.be.undefined

        expect(m.pattern.getEnglishFragments()[0].en(m)).to.equal('there is no car')

    })

    it('handles transforms', () => {
        let dwaPhrase = new Phrase('два', [ 
            PhrasePattern.fromString(
                'два genitive',
                '(1) [something->pl]', 
                words, inflections) 
        ])
        phrases.add(dwaPhrase)

        let sentence = new Sentence([
            dwa, mashina.inflect('gen'), 
        ], 0)

        let m = dwaPhrase.match({
            sentence: sentence,
            words: sentence.words,
            facts: facts
        })
 
        expect(m).to.not.be.undefined

        expect(m.pattern.getEnglishFragments()[0].en(m)).to.equal('two cars')

        dwaPhrase = new Phrase('два', [ 
            PhrasePattern.fromString(
                'два phrase:np@gen',
                '(1) [something->pl]', 
                words, inflections) 
        ])
        phrases.add(dwaPhrase)

        m = dwaPhrase.match({
            sentence: sentence,
            words: sentence.words,
            facts: facts
        })
 
        expect(m).to.not.be.undefined

        expect(m.pattern.getEnglishFragments()[0].en(m)).to.equal('two cars')
        expect(m.pattern.getEnglishFragments()[0].enWithJpForCases(m)).to.equal('two машина')
    })

    it('handles any', () => {
        let dwaPhrase = new Phrase('два', [ 
            PhrasePattern.fromString(
                'два any genitive',
                '(1) ... [something->pl]', 
                words, inflections) 
        ])
        phrases.add(dwaPhrase)

        let sentence = new Sentence([
            dwa, mashina.inflect('gen'), 
        ], 0)

        let m = dwaPhrase.match({
            sentence: sentence,
            words: sentence.words,
            facts: facts
        })
 
        expect(m).to.not.be.undefined

        expect(m.pattern.getEnglishFragments()[0].en(m)).to.equal('two')
        expect(m.pattern.getEnglishFragments()[1].en(m)).to.equal('cars')
    })


    it('handles any with both translation on one side', () => {
        let dwaPhrase = new Phrase('два', [ 
            PhrasePattern.fromString(
                'два any genitive',
                '... (1) [something->pl]', 
                words, inflections) 
        ])
        phrases.add(dwaPhrase)

        let sentence = new Sentence([
            dwa, mashina.inflect('gen'), 
        ], 0)

        let m = dwaPhrase.match({
            sentence: sentence,
            words: sentence.words,
            facts: facts
        })
 
        expect(m).to.not.be.undefined
        expect(m.pattern.getEnglishFragments().length).to.equal(2)

        expect(m.pattern.getEnglishFragments()[1].en(m)).to.equal('two cars')
        expect(m.pattern.getEnglishFragments()[0].en(m)).to.equal('')
    })

})
