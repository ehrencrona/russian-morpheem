/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Phrase from '../../shared/phrase/Phrase'
import PhraseCase from '../../shared/phrase/PhraseCase'
import CaseStudyMatch from '../../shared/phrase/CaseStudyMatch'
import Fact from '../../shared/fact/Fact'
import InflectedWord from '../../shared/InflectedWord'
import { FORMS, CASES } from '../../shared/inflection/InflectionForms'

import UnknownFact from './UnknownFact'

import { FactComponentProps } from './UnknownFactComponent'

let React = { createElement: createElement }

let desiredPhraseCaseComponent = (props: FactComponentProps<PhraseCase>) => {
    let phraseCase: PhraseCase = props.fact

    let phrase = phraseCase.phrase 
    let match = phrase.match(props.sentence.words, props.corpus.facts)

    let words, explanation
    
    if (match) {
        let blocks = match.pattern.getEnglishFragments()
        
        explanation = blocks.map((b) => b.enWithJpForCases(match)).join(' ')

        words = match.words
            .filter((m) => m.wordMatch.isCaseStudy() && ((m.wordMatch as any) as CaseStudyMatch).getCaseStudied() == phraseCase.grammaticalCase)
            .map((m) => props.sentence.words[m.index])
            .map((word) => (word instanceof InflectedWord ? word.word.getDefaultInflection().jp : word.jp)).join(' ')
    }
    else {
        explanation = phrase.patterns[0].en

        console.error(phrase.id + ' did not match ' + props.sentence)
    }

    return <div>
        you are looking for the case of <strong>
            { words }
        </strong> when used in the meaning of <strong>
            { explanation }
        </strong>

    </div>
}

export default desiredPhraseCaseComponent
