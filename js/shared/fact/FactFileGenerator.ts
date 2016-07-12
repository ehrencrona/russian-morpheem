"use strict";

import Fact from './Fact';
import Facts from './Facts';
import InflectionFact from '../inflection/InflectionFact';
import InflectableWord from '../InflectableWord';
import Word from '../Word';
import Phrase from '../phrase/Phrase'
import { EndingTransform } from '../Transforms'

export function factToString(fact: Fact, facts: Facts) {
    let tags = facts.getTagsOfFact(fact).map((tag) => ', tag: ' + tag).join('')
    
    if (fact instanceof InflectionFact) {
        return 'grammar: ' + fact.getId() + tags
    }
    else if (fact instanceof InflectableWord) {
        let ending = fact.inflection.getEnding(fact.inflection.defaultForm)
        let suffix: string = fact.inflection.getSuffix(ending, fact.stem).suffix

        return fact.stem + '--' + '<'.repeat(ending.subtractFromStem) + suffix + 
            (fact.classifier ? `[${ fact.classifier }]` : '') + 
            ': ' + fact.en + ', inflect: ' + fact.inflection.getId() + tags +
            (fact.mask ? ', mask: ' + fact.getMaskId() : '')
    }
    else if (fact instanceof Word) {
        return fact.jp +
            (fact.classifier ? `[${ fact.classifier }]` : '') + ': ' + fact.getEnglish('') + 
            (fact.required ? ', ' + fact.required.map((fact) => 'grammar: ' + fact.getId()).join(', ') : '') + 
            tags
    }
    else if (fact instanceof EndingTransform) {
        return 'transform: ' + fact.getId()
    }
    else if (fact instanceof Phrase) {
        return `phrase: ${fact.id}`
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
