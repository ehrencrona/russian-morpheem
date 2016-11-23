import InflectedWord from '../../InflectedWord';
import { Match } from '../../phrase/Match';
import { CASES, FORMS } from '../../inflection/InflectionForms';
import { getNamedForm } from '../../inflection/WordForms';
import { Gender, GrammarCase } from '../../inflection/Dimensions';

import PivotDimension from './PivotDimension'
import FactLinkComponent from '../fact/FactLinkComponent';
import Phrase from '../../../shared/phrase/Phrase'
import InflectableWord from '../../../shared/InflectableWord'
import Inflection from '../../../shared/inflection/Inflection'
import Ending from '../../../shared/Ending'

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
