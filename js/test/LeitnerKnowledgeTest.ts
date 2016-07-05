
import { expect } from 'chai';

import { LeitnerKnowledge, DECK_COUNT } from '../shared/study/LeitnerKnowledge'
import Facts from '../shared/fact/Facts';
import Word from '../shared/Word';

import { Exposure, SKILL_KNEW, SKILL_DIDNT_KNOW, SKILL_UNCLEAR } from '../shared/study/Exposure'

function expose(factId: string, knew: boolean): Exposure {
    return {
        fact: factId,
        sentence: 4711,
        user: 4711,
        skill: (knew ? SKILL_KNEW : SKILL_DIDNT_KNOW),
        time: new Date(),
        type: 0
    }
}

describe('LeitnerKnowledge', () => {

    let facts = new Facts()
        .add(new Word('word1'))
        .add(new Word('word2'))
        .add(new Word('word3'))

    it('handles first appearance of facts', () => {

        let knowledge = new LeitnerKnowledge(facts)

        knowledge.processExposures([ expose('word1', false) ])
        knowledge.processExposures([ expose('word2', true) ])

        expect(knowledge.deckOfFact(facts.get('word1'))).to.equal(0)
        expect(knowledge.deckOfFact(facts.get('word2'))).to.equal(-1)
    
    })

    it('moves facts correctly', () => {

        let knowledge = new LeitnerKnowledge(facts)

        knowledge.processExposures([ expose('word1', false), expose('word1', false) ])

        expect(knowledge.deckOfFact(facts.get('word1'))).to.equal(0)

        knowledge.processExposures([ expose('word1', true) ])

        expect(knowledge.deckOfFact(facts.get('word1'))).to.equal(1)

        knowledge.processExposures([ expose('word1', true) ])

        expect(knowledge.deckOfFact(facts.get('word1'))).to.equal(2)

        knowledge.processExposures([ expose('word1', false) ])

        expect(knowledge.deckOfFact(facts.get('word1'))).to.equal(1)

        expect(knowledge.size).to.equal(1)

    })


    it('retires facts correctly', () => {

        let knowledge = new LeitnerKnowledge(facts)

        let exposures = []

        exposures.push(expose('word1', false))

        for (let i = 0; i < 10; i++) {
            exposures.push(expose('word1', true))
        }

        knowledge.processExposures(exposures)

        expect(knowledge.deckOfFact(facts.get('word1'))).to.equal(-1)
        expect(knowledge.isKnown(facts.get('word1'))).to.be.true

        expect(knowledge.size).to.equal(0)

        knowledge.processExposures([ expose('word1', false) ])

        expect(knowledge.deckOfFact(facts.get('word1'))).to.equal(DECK_COUNT-1)
        expect(knowledge.isKnown(facts.get('word1'))).to.be.false

        expect(knowledge.size).to.equal(1)

        knowledge.processExposures([ expose('word1', true) ])

        expect(knowledge.deckOfFact(facts.get('word1'))).to.equal(-1)
        expect(knowledge.isKnown(facts.get('word1'))).to.be.true
        expect(knowledge.size).to.equal(0)


    })
})