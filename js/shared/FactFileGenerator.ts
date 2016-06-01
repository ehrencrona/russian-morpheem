"use strict";

import Fact from './Fact';
import Facts from './Facts';
import InflectionFact from './InflectionFact';
import InflectableWord from './InflectableWord';
import Word from './Word';

export function factToString(fact: Fact) {
    if (fact instanceof InflectionFact) {
        return 'grammar: ' + fact.getId()
    }
    else if (fact instanceof InflectableWord) {
        let ending = fact.inflection.getEnding(fact.inflection.defaultForm)
        
        return fact.stem + '--' + (ending.subtractFromStem ? '<' : '') + ending.suffix + 
            ': ' + fact.en + ', inflect: ' + fact.inflection.getId()
    }
    else if (fact instanceof Word) {
        return fact.jp +
            (fact.classifier ? `[${ fact.classifier }]` : '') + ': ' + fact.getEnglish('') + 
            (fact.required ? ', ' + fact.required.map((fact) => 'grammar: ' + fact.getId()).join(', ') : '')            
    }
    else if (!fact) {
        return ''
    }
    else {
        throw new Error('Unhandled fact type ' + fact.constructor.name + ' of ' + fact.getId())
    }
}

export default function factsToString(facts: Facts) {
    return facts.facts.map(factToString).join('\n')
}