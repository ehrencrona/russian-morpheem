import { WordForm } from '../shared/inflection/WordForm';

import Inflections from '../shared/inflection/Inflections';
import Inflection from '../shared/inflection/Inflection';

import findBestExistingInflection from '../shared/GenerateInflection';
import { generateEnding, findStem, getWrongForms } from '../shared/GenerateInflection';

import { parseEndings } from '../shared/inflection/InflectionsFileParser'
import { PartOfSpeech as PoS } from '../shared/inflection/Dimensions'

import { expect } from 'chai';

describe('GenerateInflection', function() {
    it('handles simple cases', function () {
        let inflections = new Inflections([            
            new Inflection('regular', 'inf', new WordForm({ pos: PoS.VERB }), 
                parseEndings('inf: а, 1: в', 'ru', PoS.VERB).endings),
            new Inflection('irregular', 'nom', new WordForm({ pos: PoS.VERB }), 
                parseEndings('inf: в, 1: а', 'ru', PoS.VERB).endings)
        ])
  
        let best = findBestExistingInflection({ 'inf': 'хув', '1': 'хуа' }, 'ru', inflections)
        
        expect(best.inflection.id).to.equal('irregular')
        expect(best.stem).to.equal('ху')
        expect(best.wrongForms.length).to.equal(0)
    })

    it('handles compromises', function () {
        let inflections = new Inflections([            
            new Inflection('regular', 'inf', new WordForm({ pos: PoS.VERB }), 
                parseEndings('inf: ить, 1: у, 2: ешь', 'ru', PoS.VERB).endings),
            new Inflection('irregular', 'nom', new WordForm({ pos: PoS.VERB }), 
                parseEndings('inf: ть, 1: ву, 2: ишь', 'ru', PoS.VERB).endings)
        ])
  
        let best = findBestExistingInflection({ 'inf': 'жить', '1': 'живу', '2': 'живешь' }, 'ru', inflections)
        
        expect(best.inflection.id).to.equal('regular')
        expect(best.stem).to.equal('жив')
        expect(best.wrongForms.length).to.equal(1)
    })

    it('handles removing characters', function () {
        let inflections = new Inflections([            
            new Inflection('regular', 'inf', new WordForm({ pos: PoS.VERB }), 
                parseEndings('inf: <ить, 1: ю', 'ru', PoS.VERB).endings),
            new Inflection('irregular', 'nom', new WordForm({ pos: PoS.VERB }), 
                parseEndings('inf: ить, 1: ю', 'ru', PoS.VERB).endings)
        ])
  
        let best = findBestExistingInflection({ 'inf': 'любить', '1': 'люблю' }, 'ru', inflections)
        
        expect(best.inflection.id).to.equal('regular')
        expect(best.stem).to.equal('любл')
        expect(best.wrongForms.length).to.equal(0)
    })
    
    it('handles partial inflections', function () {
        let inflections = new Inflections([            
            new Inflection('best', 'inf', new WordForm({ pos: PoS.VERB }),
                parseEndings('inf: <ить, 1: ю, 3: <ит', 'ru', PoS.VERB).endings),
            new Inflection('worse', 'inf', new WordForm({ pos: PoS.VERB }),
                parseEndings('inf: <ить, 1: ю, 2: х, 3: у', 'ru', PoS.VERB).endings),
        ])
  
        let best = findBestExistingInflection({ 'inf': 'любить', '1': 'люблю', '2': 'любишь', '3': 'любит' }, 'ru', inflections)
        
        expect(best.inflection.id).to.equal('best')
        expect(best.stem).to.equal('любл')
        expect(best.wrongForms.length).to.equal(0)
    })

    it('generates correct new endings', function() {
        expect(generateEnding('foo', 'foobar').suffix).to.equal('bar')
        expect(generateEnding('foo', 'foobar').subtractFromStem).to.equal(0)

        expect(generateEnding('foos', 'foobar').suffix).to.equal('bar')
        expect(generateEnding('foos', 'foobar').subtractFromStem).to.equal(1)

        expect(generateEnding('fooss', 'foo').suffix).to.equal('')
        expect(generateEnding('fooss', 'foo').subtractFromStem).to.equal(2)
    })
    
    it('calculates number of wrong endings considering relative to', () => {
        let inflection =      
            new Inflection('best', 'inf', new WordForm({ pos: PoS.VERB }),
                parseEndings('inf: сать, pastm: ал, pastf: pastm-а, pastn: pastm-о', 'ru', PoS.VERB).endings)

        let wf = getWrongForms('пи', {
            inf: 'писать',
            pastm: 'писал',
            pastf: 'писала',
            pastn: 'писало'
        }, inflection)

        expect(wf.wrongForms).to.deep.equal([ 'pastm' ])
        expect(wf.right).to.equal(3)
    })
    
    it('finds best stem', () => {
        
        expect(findStem({ 
            1: 'abba',
            2: 'abbc',
            3: 'accd'
         })).to.equal('abb')

    })
})
