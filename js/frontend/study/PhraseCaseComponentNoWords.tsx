

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import InflectedWord from '../../shared/InflectedWord'
import Phrase from '../../shared/phrase/Phrase'
import PhraseCase from '../../shared/phrase/PhraseCase'
import shouldHideWord from './shouldHideWord'

import { FORMS, CASES } from '../../shared/inflection/InflectionForms'
import { FactComponentProps } from './StudyFactComponent'

let React = { createElement: createElement }

// used for phrases that are only about using a certain case in a meaning with no study words, e.g. "genitive means possession"
let phraseCaseComponentNoWords = (props: FactComponentProps<PhraseCase>) => {
    let phraseCase: PhraseCase = props.fact

    let phrase = phraseCase.phrase 
    let match = phrase.match(props.sentence.words, props.corpus.facts)

    let explanation, words

    if (match) {
        let blocks = match.pattern.getEnglishFragments()

        explanation = blocks.map((b) => b.enWithJpForCases(match)).join(' ') 
        
        words = match.words.map((m) => props.sentence.words[m.index])
            .map((word) => 

                (shouldHideWord(word, props.hiddenFacts) ?
                    word.getEnglish() : 
                    word.jp)

            ).join(' ')
    }
    else {
        explanation = phrase.patterns[0].en

        console.error(phrase.id + ' did not match ' + props.sentence)
    }

    return <div>
        <strong>
            { words }
        </strong> uses the <strong>
            { FORMS[CASES[phraseCase.grammaticalCase]].name }
        </strong> to mean <strong>
            { explanation }
        </strong>
    </div>
}

export default phraseCaseComponentNoWords
