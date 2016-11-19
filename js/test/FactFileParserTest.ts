import { parseFactFile as parser } from '../shared/fact/FactFileParser'

import { expect } from 'chai';

import Word from '../shared/Word'
import AbstractFact from '../shared/fact/AbstractFact'
import Inflections from '../shared/inflection/Inflections'
import WORD_FORMS from '../shared/inflection/WordForms'
import Inflection from '../shared/inflection/Inflection'
import Words from '../shared/Words'
import Sentences from '../shared/Sentences'
import Facts from '../shared/fact/Facts'
import InflectableWord from '../shared/InflectableWord'
import { EndingTransform } from '../shared/Transforms'
import { parseEndings } from '../shared/inflection/InflectionsFileParser'
import AnyWord from '../shared/AnyWord'

var inflections = new Inflections()

inflections.add(new Inflection('inflection', 'nom', null, 
    parseEndings('nom: a', WORD_FORMS['pron']).endings))

inflections.add(new Inflection('lastchar', 'nom', null, 
    parseEndings('nom: <a', WORD_FORMS['pron']).endings))

describe('FactFileParser', function() {
    it('parses word and meaning', function () {
        var [ facts, words ] = parser('word:meaning, pl: meanings', inflections, 'ru')
        let word = facts.facts[0]
        
        expect(word.toString()).to.equal('word')

        expect(word).to.be.instanceOf(Word)

        expect((<Word> word).getEnglish()).to.equal('meaning')
        expect((<Word> word).getEnglish('pl')).to.equal('meanings')
    })

    it('parses inflected words', function () {
        var [ facts, words ] = parser('wordd--<a:meaning, inflect: lastchar', inflections, 'ru')
        let word = facts.facts[0]

        expect(word.getId()).to.equal('worda')

        expect(word).to.be.instanceOf(InflectableWord)

        expect((<InflectableWord> word).getEnglish()).to.equal('meaning')
    })

    it('parses classifiers', function () {
        var [ facts, words ] = parser(
            [
                'word[a]:meaning',
                'word[b]:meaning',
                'iwa[a]:meaning, inflect: inflection',
                'iwa[b]:meaning, inflect: inflection',
            ].join('\n')
            , inflections, 'ru')

        expect(facts.facts.length).to.equal(4)

        expect(facts.get('iwa[b]')).to.not.be.null
    })
    
    it('parses PoS', function () {
        var [ facts, words ] = parser(
            'word:meaning, pos: verb', inflections, 'ru')

        expect((facts.facts[0] as Word).wordForm.pos).to.equal('verb')
    })

    it('parses grammar facts', function () {
        var [ facts, words ] = parser('grammar:inflection@nom', inflections, 'ru')
        let fact = facts.facts[0]
        
        expect(fact).to.be.instanceOf(AbstractFact)

        if (fact instanceof AbstractFact) {
            expect(fact.id).to.equal('inflection@nom')
        }
    })
    
    it('parses tagged grammar facts', function () {
        var [ facts, words ] = parser('grammar:inflection@nom, tag: foo', inflections, 'ru')
        let fact = facts.facts[0]

        expect(fact).to.be.instanceOf(AbstractFact)

        if (fact instanceof AbstractFact) {
            expect(fact.id).to.equal('inflection@nom')
        }
        
        expect(facts.getTagsOfFact(fact)).to.deep.equal(['foo'])
    })
    
    it('parses transform facts', function () {
        var [ facts, words ] = parser('transform: yToI', inflections, 'ru')
        let fact = facts.facts[0]

        expect(fact).to.be.instanceOf(EndingTransform)

        expect(fact.getId()).to.equal('yToI')
    })

    it('handles classifiers', function () {
        var [ facts, words ] = parser('word[type]:meaning', inflections, 'ru')
        let word = facts.facts[0]
        
        expect(word).to.be.instanceOf(Word)

        if (word instanceof Word) {
            expect(word.jp).to.equal('word')
            expect(word.classifier).to.equal('type')
        }
    })

    it('handles requires', function () {
        var [ facts, words ] = parser('a:meaning\nb:meaning, grammar: a', inflections, 'ru')

        let a = facts.facts[0]
        let b = facts.facts[1]

        expect(a).to.be.instanceOf(Word)
        expect(b).to.be.instanceOf(Word)

        if (a instanceof Word && b instanceof Word) {
            expect(b.required[0]).to.equal(a)
        }
    })
})
