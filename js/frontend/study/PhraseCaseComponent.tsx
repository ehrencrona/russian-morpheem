/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Phrase from '../../shared/phrase/Phrase'
import PhraseCase from '../../shared/phrase/PhraseCase'
import CaseStudyMatch from '../../shared/phrase/CaseStudyMatch'
import InflectedWord from '../../shared/InflectedWord'
import { FORMS, CASES } from '../../shared/inflection/InflectionForms'

import shouldHideWord from './shouldHideWord'
import { FactComponentProps } from './StudyFactComponent'

let React = { createElement: createElement }

let phraseFactComponent = (props: FactComponentProps<PhraseCase>) => {
    let phraseCase: PhraseCase = props.fact

    let phrase = phraseCase.phrase 
    let match = phrase.match(props.sentence.words, props.corpus.facts)

    let words, phraseString

    if (match) {
        phraseString = match.words.map((w) => (
            shouldHideWord(w.word, props.hiddenFacts) ?
                w.word.getEnglish() :
                w.word.jp)).join(' ') 

        words = match.words
            .filter((m) => m.wordMatch.isCaseStudy() && ((m.wordMatch as any) as CaseStudyMatch).getCaseStudied() == phraseCase.grammaticalCase)
            .map((m) => props.sentence.words[m.index])
            .map((word) => 
                (   
                    shouldHideWord(word, props.hiddenFacts) ?
                        word.getEnglish() :
                        (word instanceof InflectedWord ? word.word.getDefaultInflection().jp : word.jp)
                )).join(' ')
    }
    else {
        phraseString = phrase.patterns[0].en

        console.error(phrase.id + ' did not match ' + props.sentence)
    }

    return <div><strong>
            { words }
        </strong> must be in the <strong>
            { FORMS[CASES[phraseCase.grammaticalCase]].name }
        </strong> when used as <strong>
            { phraseString }
        </strong>

    </div>
}

export default phraseFactComponent;
