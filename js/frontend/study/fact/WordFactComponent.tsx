

import { Component, createElement } from 'react'
import Corpus from '../../../shared/Corpus'
import InflectedWord from '../../../shared/InflectedWord'
import InflectableWord from '../../../shared/InflectableWord'
import Word from '../../../shared/Word'
import Translatable from '../../../shared/Translatable'
import Fact from '../../../shared/fact/Fact'

import { FactComponentProps } from './StudyFactComponent'

let React = { createElement: createElement }

export interface TranslatableFact extends Fact, Translatable {
}

let wordFactComponent = (props: FactComponentProps<TranslatableFact>) => {
    
    let fact = props.fact

    let word: Word
    
    if (fact instanceof InflectableWord) {
        word = fact.getDefaultInflection()
    }
    else if (fact instanceof Word) {
        word = fact
    }
    
    let seeAlso = <span key='noalt'/>

    if (word) {
        let alternatives: Word[] = props.corpus.words.ambiguousForms[word.jp]

        if (alternatives) {
            let found: { [en: string]: boolean } = {}

            found[word.getEnglish()] = true

            alternatives = alternatives.filter(alt => {
                let en = alt.getEnglish()
                let unique = !found[en]

                found[en] = true

                return unique
            })

            if (alternatives.length > 0) {
                seeAlso = <span key='alt'>(it can also mean { 
                    alternatives.map((alt, index) => <span key={ alt.getEnglish() }>{ 
                        index > 0 ? (index == alternatives.length-1 ? ' or ' : ', ') : '' 
                    }<strong>{ alt.getEnglish() }</strong></span>)
                })
                </span>
            }
        }
    } 

    return <div><strong className='nobr verbatim'>{ 
        props.fact.toText() 
    }</strong> means <strong className='nobr'>{ word.getEnglish() }</strong> {seeAlso}</div>
}

export default wordFactComponent;
