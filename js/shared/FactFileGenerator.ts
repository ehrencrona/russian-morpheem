"use strict";

import Facts from './Facts';
import InflectionFact from './InflectionFact';
import InflectableWord from './InflectableWord';
import Word from './Word';

export default function facsToString(facts: Facts) {
    let res = ''

    facts.facts.forEach((fact) => {
        if (fact instanceof InflectionFact) {
            res += 'grammar: ' + fact.getId() + '\n'
        }
        else if (fact instanceof InflectableWord) {
            let ending = fact.inflection.getEnding(fact.inflection.defaultForm)
            
            res += fact.stem + '--' + (ending.subtractFromStem ? '<' : '') + ending.suffix + 
                ': ' + fact.en + ', inflect: ' + fact.inflection.getId() + '\n'
        }
        else if (fact instanceof Word) {
            res += fact.jp + ': ' + fact.getEnglish('') + '\n'            
        }
        else {
            console.error('Unhandled fact type ' + fact.constructor.name + ' of ' + fact.getId())
        }
   })

    return res
}