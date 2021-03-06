import mapFind from '../../mapFind';
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

interface Text {
    jp: string
    en: string
    match: Match
}

const NO_PHRASE = ''

export class MatchTextDimension implements PivotDimension<Match, Text> {
    name = ''

    constructor(public renderText?: boolean) {
    }

    getKey(value: Text) {
        return value.jp
    }

    getValues(match: Match): Text[] {
        return [ {
            jp: match.words.map(w => w.word.toText()).join(' '),
            en: (match.pattern?
                match.pattern.getEnglishFragments().map(frag => frag.en(match)).join(' ') :
                (this.renderText 
                    ? match.words.map(w => w.word.getEnglish()).join(' ')
                    : NO_PHRASE)
            ),
            match: match,
        } ]
    }

    renderValue(value: Text, valueIndex: number) {
        if (!this.renderText && value.en === NO_PHRASE && valueIndex == 0) {
            return null
        }

        return <div key={ value.jp } className='phraseGroup'>
            <div className='jp'>{ value.jp }</div>
            <div className='en'>{ value.en }</div>
        </div>
    }

}

export default MatchTextDimension

export class MatchPhraseDimension extends MatchTextDimension {
    // addedPhraseId is for verb phrases grouping by what comes after the verb.
    constructor(public addedPhraseId?: string) {
        super()
    }

    getKey(value: Text) {
        if (value.match.phrase) {
            let result = value.match.phrase.id

            if (result == this.addedPhraseId) {
                result = mapFind(value.match.words, w => w.childMatch ? w.childMatch.phrase.id : null)
            }

            return result
        }
        else {
            return 'nophrase'
        }
    }
}
