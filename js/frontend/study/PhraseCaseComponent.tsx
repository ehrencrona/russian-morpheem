

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

    let wordString, phraseString

    if (match) {
        phraseString = match.words.map((w) => (
            shouldHideWord(w.word, props.hiddenFacts) ?
                w.word.getEnglish() :
                w.word.jp)).join(' ') 

        let wordToString = (word) =>
            (shouldHideWord(word, props.hiddenFacts) ?
                word.getEnglish() :
                (word instanceof InflectedWord ? word.word.getDefaultInflection().jp : word.jp))

        wordString = ''
        let lastIndex = 0

        match.words
            .filter((m) => m.wordMatch.isCaseStudy() && ((m.wordMatch as any) as CaseStudyMatch).getCaseStudied() == phraseCase.grammaticalCase)
            .forEach((m) => {
                if (wordString && m.index > lastIndex+1) {
                    wordString += ' and '
                }

                wordString += wordToString(props.sentence.words[m.index]) + ' '
                lastIndex = m.index 
            })
    }
    else {
        phraseString = phrase.patterns[0].en

        console.error(phrase.id + ' did not match ' + props.sentence)
    }

    return <div><strong className='nobr'>
            { wordString }
        </strong> must be in the <strong className='nobr'>
            { FORMS[CASES[phraseCase.grammaticalCase]].name }
        </strong> when used as <strong className='nobr'>
            { phraseString }
        </strong>

    </div>
}

export default phraseFactComponent;
