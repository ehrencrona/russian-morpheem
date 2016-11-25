import { AbstractAnyWord } from '../../AbstractAnyWord';
import Fact from '../../fact/Fact';
import { Match } from '../../phrase/Match';

import PivotDimension from './PivotDimension'
import FactLinkComponent from '../fact/FactLinkComponent';
import Phrase from '../../../shared/phrase/Phrase'

import { Component, createElement } from 'react';

let React = { createElement: createElement }

export default class DerivationFormationDimension implements PivotDimension<Fact, string> {
    name = 'Formation'

    constructor(public derivationId: string, public allowNone) {
    }

    getKey(value: string) {
        return value
    }

    getValues(word: Fact): string[] {
        if (word instanceof AbstractAnyWord) {
            let result = word.getDerivedWords(this.derivationId).map(derivedWord => {
                let t1 = word.toText()
                let t2 = derivedWord.toText()

                let result = getPrefixSuffix(t1, t2) || getPrefixSuffix(t2, t1) || getCommonRoot(t1, t2) 
                
                if (!result) {
                    t1 = t1.replace('ё', 'е')
                    t2 = t2.replace('ё', 'е')

                    result = getPrefixSuffix(t1, t2) || getPrefixSuffix(t2, t1) || getCommonRoot(t1, t2)

                    if (result) {
                        result = 'ё ← е and ' + result
                    }
                }

                return result || 'irregular'
            })

            if (!result.length && this.allowNone) {
                result = [ 'none' ]
            }

            return result
        }
    }

    renderValue(value: string) {
        return <div key={ value } className='phraseGroup'>
            <div className='jp'>{ value }</div>
        </div>
    }

}

function getPrefixSuffix(s1, s2) {
    let i = s1.indexOf(s2) 
    
    if (i > 0) {
        return s1.substr(0, i) + '–' + s1.substr(i + s2.length) 
    }
}

function getCommonRoot(s1, s2) {
    let MIN = 3

    if (s1.substr(0, 3) != s2.substr(0, 3)) {
        return
    }

    let to = Math.max(s1.length, s2.length)

    for (let i = 3; i < to; i++) {
        if (s1[i] != s2[i]) {
            // avoid writing "to empty"
            if (i == to-1) {
                i--
            }

            return s1.substr(i) + ' ← ' + s2.substr(i)
        }
    }

    return 'equal'
}