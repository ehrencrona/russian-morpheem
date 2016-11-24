import InflectedWord from '../../InflectedWord';
import AnyWord from '../../AnyWord';
import { Match } from '../../phrase/Match';

import PivotDimension from './PivotDimension'
import FactLinkComponent from '../fact/FactLinkComponent';
import Phrase from '../../../shared/phrase/Phrase'
import InflectableWord from '../../../shared/InflectableWord'

import { Component, createElement } from 'react';

let React = { createElement: createElement }

export default class MatchDefaultFormDimension implements PivotDimension<Match, AnyWord> {
    name = ''

    constructor(public renderText?: boolean) {
    }

    getKey(value: AnyWord) {
        return value.getId()
    }

    getValues(match: Match): AnyWord[] {
        let word = match.words[0].word

        if (word instanceof InflectedWord) {
            return [ word.word ]
        }
        else {
            return [ word ]
        }
    }

    renderValue(value: AnyWord) {
        return <div key={ value.getId() } className='phraseGroup'>
            <div className='jp'>{ value.toText() }</div>
            <div className='en'>{ value.getEnglish()  }</div>
        </div>
    }

}

