
import { Component, createElement } from 'react'
import Corpus from '../../../shared/Corpus'
import InflectedWord from '../../../shared/InflectedWord'
import Phrase from '../../../shared/phrase/Phrase'
import shouldHideWord from '../shouldHideWord'
import htmlEscape from '../../../shared/util/htmlEscape'

import { FactComponentProps } from './StudyFactComponent'

let React = { createElement: createElement }

let phraseFactComponent = (props: FactComponentProps<Phrase>) => {
    let phrase: Phrase = props.fact
    let match = phrase.match({words: props.sentence.words, facts: props.corpus.facts})

    let explanation, words = ''

    if (match) {
        let blocks = match.pattern.getEnglishFragments()

        explanation = blocks.map((b) => {
            let text = htmlEscape(b.enWithJpForCases(match))

            if (!b.placeholder) {
                text = `<strong className="verbatim">${text}</strong>`
            }

            return text
        }).join(' ') 
        
        words = match.words
            .map((m) => {
                let word = props.sentence.words[m.index]

                let text = htmlEscape(shouldHideWord(word, props.hiddenFacts) ?
                    word.getEnglish() : 
                    word.jp)

                if (!m.wordMatch.isCaseStudy()) {
                    text = `<strong>${text}</strong>`
                }

                return text
            }).join(' ')
    }
    else {
        explanation = phrase.patterns[0].en

        console.error(phrase.id + ' did not match ' + props.sentence)
    }

    return <div><span className='nobr' 
        dangerouslySetInnerHTML={ { __html: words } }/> means <span className='nobr' 
        dangerouslySetInnerHTML={ { __html: explanation } }/>
    </div>
}

export default phraseFactComponent;
