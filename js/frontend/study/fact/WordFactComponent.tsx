import { Aspect, PartOfSpeech } from '../../../shared/inflection/Dimensions';


import { Component, createElement } from 'react'
import Corpus from '../../../shared/Corpus'
import InflectedWord from '../../../shared/InflectedWord'
import InflectableWord from '../../../shared/InflectableWord'
import Word from '../../../shared/Word'
import Translatable from '../../../shared/Translatable'
import Fact from '../../../shared/fact/Fact'
import getWordTranslationInSentence from '../../../shared/getWordTranslationInSentence'

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
    let derived = null

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

        if (word.wordForm.aspect == Aspect.PERFECTIVE 
            && word.getDerivedWords('imperf')) {
            derived = <span>(perfective of <strong>{
                word.getDerivedWords('imperf').map(w => w.toText()).join('and')
            }</strong>)</span>
        }
        else if (word.wordForm.pos == PartOfSpeech.ADVERB &&
            word.getDerivedWords('adj')) {
            derived = <span>(adverb of <strong>{
                word.getDerivedWords('adj').map(w => w.toText()).join('and')
            }</strong>)</span>
        }
    } 

    let inflectedWord = props.fact

    let translation: string
    
    if (fact instanceof InflectableWord) {
        // search for the inflected word but show the uninflected.
        let originalFormWord = props.studyFact.words[0].word

        translation = word.getDictionaryFormOfTranslation(
            getWordTranslationInSentence(originalFormWord, props.sentence.en()))
    }
    else {
        translation = getWordTranslationInSentence(word, props.sentence.en())
    }

    return <div><strong className='nobr verbatim'>{ 
        props.fact.toText() 
    }</strong> means <strong className='nobr'>{ 
        translation 
    }{
        translation != word.getEnglish() ?
            ' / ' + word.getEnglish()
            : 
            null
    }</strong> { 
        seeAlso 
    } { 
        derived 
    }</div>
}

export default wordFactComponent;
