"use strict";

import Facts from './Facts';
import InflectionFact from './InflectionFact';
import InflectedWord from './InflectedWord';
import Word from './Word';

export default function facsToString(facts: Facts) {
    let res = ''

    facts.facts.forEach((fact) => {
        if (fact instanceof InflectionFact) {
            res += 'grammar: ' + fact.getId() + '\n'
        }
        else if (fact instanceof InflectedWord) {
            res += fact.stem + '--' + fact.inflection.getEnding(fact.form) + 
                ': ' + fact.getEnglish('') + ', inflect: ' + fact.inflection.getId() + '\n'
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