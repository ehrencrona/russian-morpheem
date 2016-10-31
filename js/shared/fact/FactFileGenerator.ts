"use strict"

import Word from '../Word'
import { EndingTransform } from '../Transforms'

import Fact from './Fact'
import Facts from './Facts'
import TagFact from '../TagFact'
import InflectableWord from '../InflectableWord'
import InflectionFact from '../inflection/InflectionFact'
import Phrase from '../phrase/Phrase'

export function factToString(fact: Fact, facts: Facts) {
    let tags = facts.getTagsOfFact(fact).map((tag) => ', tag: ' + tag).join('')

    let nonDefaultEnglish = (word: Word | InflectableWord) => {
        let result = ''

        for (let form in word.en) {
            if (form && word.en[form]) {
                result += `, ${form}: ${word.en[form]}` 
            }
        }

        return result
    }

    if (fact instanceof InflectableWord) {
        let ending = fact.inflection.getEnding(fact.inflection.defaultForm)
        let suffix: string = fact.inflection.getSuffix(ending, fact.stem).suffix

        return fact.stem + '--' + '<'.repeat(ending.subtractFromStem) + suffix + 
            (fact.classifier ? `[${ fact.classifier }]` : '') + 
            ': ' + fact.getEnglish() +
            nonDefaultEnglish(fact) +
            ', inflect: ' + fact.inflection.getId() + tags +
            (fact.pos && fact.inflection.pos != fact.pos ? ', pos: ' + fact.pos : '') +
            (fact.mask ? ', mask: ' + fact.getMaskId() : '')
    }
    else if (fact instanceof Word) {
        return fact.jp +
            (fact.classifier ? `[${ fact.classifier }]` : '') + ': ' + fact.getEnglish('') + 
            nonDefaultEnglish(fact) +
            (fact.pos ? ', pos: ' + fact.pos : '') +
            (fact.required ? ', ' + fact.required.map((fact) => 'grammar: ' + fact.getId()).join(', ') : '') + 
            tags
    }
    else if (fact instanceof EndingTransform) {
        return 'transform: ' + fact.getId()
    }
    else if (fact instanceof Phrase) {
        return `phrase: ${fact.id}`
    }
    else if (fact instanceof TagFact) {
        return `tag: ${fact.id}`
    }
    else if (fact instanceof InflectionFact) {
        return 'grammar: ' + fact.getId() + tags
    }
    else if (!fact) {
        return ''
    }
    else {
        throw new Error('Unhandled fact type ' + fact.constructor.name + ' of ' + fact.getId())
    }
}

export default function factsToString(facts: Facts) {
    return facts.facts.map((fact) => factToString(fact, facts)).join('\n')
}
