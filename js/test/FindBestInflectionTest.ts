
import Inflections from '../shared/Inflections';
import Inflection from '../shared/Inflection';

import findBestInflection from '../shared/FindBestInflection';
import { generateEnding } from '../shared/FindBestInflection';

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
  
        let best = findBestInflection({ 'inf': 'хув', '1': 'хуа' }, 'ru', inflections)
        
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
  
        let best = findBestInflection({ 'inf': 'жить', '1': 'живу', '2': 'живешь' }, 'ru', inflections)
        
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
  
        let best = findBestInflection({ 'inf': 'любить', '1': 'люблю' }, 'ru', inflections)
        
        expect(best.inflection.id).to.equal('regular')
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
})
