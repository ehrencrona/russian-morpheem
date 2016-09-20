/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Phrase from '../shared/phrase/Phrase'
import Phrases from '../shared/phrase/Phrases'
import PhrasePattern from '../shared/phrase/PhrasePattern'
import PhraseOrder from '../shared/phrase/PhraseOrder'
import Words from '../shared/Words'
import Inflections from '../shared/inflection/Inflections'

import { expect } from 'chai';

describe('PhraseOrder', () => {
    let phrases = new Phrases()
    let inflections = new Inflections()

    let words = new Words()

    let p4 = new Phrase('4', [ 
        PhrasePattern.fromString('phrase:2', '(article)(1)', words, inflections), 
        PhrasePattern.fromString('phrase:3', '(1)', words, inflections) 
    ])
    phrases.add(p4)

    let p3 = new Phrase('3', [ 
        PhrasePattern.fromString('', '(1)', words, inflections), 
    ])
    phrases.add(p3)

    let p1 = new Phrase('1', [ 
        PhrasePattern.fromString('', '(1)', words, inflections), 
    ])
    phrases.add(p1)

    let p2 = new Phrase('2', [ 
        PhrasePattern.fromString('phrase:1', '(1)', words, inflections), 
    ])
    phrases.add(p2)

    let order = new PhraseOrder(phrases)

    it('orders correctly', () => {
        // note that it's a partial ordering so other orderings are still ocrrect...
        expect(order.phrases[0]).to.equal(p1)
        expect(order.phrases[1]).to.equal(p2)
        expect(order.phrases[2]).to.equal(p3)
        expect(order.phrases[3]).to.equal(p4)
    })

})
