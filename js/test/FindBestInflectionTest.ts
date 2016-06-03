
import Inflections from '../shared/Inflections';
import Inflection from '../shared/Inflection';

import findBestExistingInflection from '../shared/FindBestInflection';
import { generateEnding, findStem, getWrongForms } from '../shared/FindBestInflection';

import { parseEndings } from '../shared/InflectionsFileParser'

import { expect } from 'chai';

describe('FindBestInflection', function() {
    it('handles simple cases', function () {
        let inflections = new Inflections([            
            new Inflection('regular', 'inf', 'ru', 
                parseEndings('inf: а, 1: в', 'ru', 'v').endings),
            new Inflection('irregular', 'nom', 'ru', 
                parseEndings('inf: в, 1: а', 'ru', 'v').endings)
        ])
  
        let best = findBestExistingInflection({ 'inf': 'хув', '1': 'хуа' }, 'ru', inflections)
        
        expect(best.inflection.id).to.equal('irregular')
        expect(best.stem).to.equal('ху')
        expect(best.wrongForms.length).to.equal(0)
    })

    it('handles compromises', function () {
        let inflections = new Inflections([            
            new Inflection('regular', 'inf', 'ru', 
                parseEndings('inf: ить, 1: у, 2: ешь', 'ru', 'v').endings),
            new Inflection('irregular', 'nom', 'ru', 
                parseEndings('inf: ть, 1: ву, 2: ишь', 'ru', 'v').endings)
        ])
  
        let best = findBestExistingInflection({ 'inf': 'жить', '1': 'живу', '2': 'живешь' }, 'ru', inflections)
        
        expect(best.inflection.id).to.equal('regular')
        expect(best.stem).to.equal('жив')
        expect(best.wrongForms.length).to.equal(1)
    })

    it('handles removing characters', function () {
        let inflections = new Inflections([            
            new Inflection('regular', 'inf', 'ru', 
                parseEndings('inf: <ить, 1: ю', 'ru', 'v').endings),
            new Inflection('irregular', 'nom', 'ru', 
                parseEndings('inf: ить, 1: ю', 'ru', 'v').endings)
        ])
  
        let best = findBestExistingInflection({ 'inf': 'любить', '1': 'люблю' }, 'ru', inflections)
        
        expect(best.inflection.id).to.equal('regular')
        expect(best.stem).to.equal('любл')
        expect(best.wrongForms.length).to.equal(0)
    })
    
    it('handles partial inflections', function () {
        let inflections = new Inflections([            
            new Inflection('best', 'inf', 'ru',
                parseEndings('inf: <ить, 1: ю, 3: <ит', 'ru', 'v').endings),
            new Inflection('worse', 'inf', 'ru',
                parseEndings('inf: <ить, 1: ю, 2: х, 3: у', 'ru', 'v').endings),
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
            new Inflection('best', 'inf', 'ru',
                parseEndings('inf: сать, pastm: ал, pastf: pastm-а, pastn: pastm-о', 'ru', 'v').endings)

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
