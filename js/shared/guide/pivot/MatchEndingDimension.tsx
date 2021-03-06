import InflectedWord from '../../InflectedWord';
import { Match } from '../../phrase/Match';
import { CASES, FORMS } from '../../inflection/InflectionForms';
import { Gender, GrammarCase } from '../../inflection/Dimensions';

import PivotDimension from './PivotDimension'

import { Component, createElement } from 'react';

let React = { createElement: createElement }

export default class MatchEndingDimension implements PivotDimension<Match, string> {
    name = ''

    getKey(value: string) {
        return value
    }

    getValues(match: Match): string[] {
        let w = match.words[0].word
        
        if (w instanceof InflectedWord) {
            return [ w.word.inflection.getEnding(w.form).suffix ]
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
