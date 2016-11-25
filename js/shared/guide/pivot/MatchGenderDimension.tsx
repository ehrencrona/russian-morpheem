import InflectedWord from '../../InflectedWord';
import { AbstractAnyWord } from '../../AbstractAnyWord'
import { Match } from '../../phrase/Match'
import { GrammarNumber } from '../../inflection/Dimensions'
import { CASES, FORMS, LONG_GENDERS } from '../../inflection/InflectionForms';
import { Gender, GrammarCase } from '../../inflection/Dimensions';

import PivotDimension from './PivotDimension'

import { Component, createElement } from 'react';

let React = { createElement: createElement }

export default class MatchGenderDimension implements PivotDimension<Match, string> {
    name = ''

    getKey(value: string) {
        return value
    }

    getValues(match: Match): string[] {
        let w = match.words[0].word

        if (w instanceof InflectedWord) {
            let form = FORMS[w.form]

            if (form.gender) { 
                return [ LONG_GENDERS[form.gender] ]
            }
            else if (form.number == GrammarNumber.PLURAL) {
                return [ 'plural' ]
            }
        }
        else {
            return [ '' ]
        }
    }

    renderValue(value: string) {
        return <div className='phraseGroup'>
            <div className='jp'>{ value }</div>
        </div>
    }
}
