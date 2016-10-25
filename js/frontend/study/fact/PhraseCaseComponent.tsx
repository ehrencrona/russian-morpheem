

import { Component, createElement } from 'react'
import Corpus from '../../../shared/Corpus'
import Phrase from '../../../shared/phrase/Phrase'
import PhraseCase from '../../../shared/phrase/PhraseCase'
import CaseStudyMatch from '../../../shared/phrase/CaseStudyMatch'
import InflectedWord from '../../../shared/InflectedWord'
import { GrammaticalCase, InflectionForm, FORMS, CASES, INFLECTION_FORMS } from '../../../shared/inflection/InflectionForms'

import shouldHideWord from '../shouldHideWord'
import { FactComponentProps } from '../fact/StudyFactComponent'

let React = { createElement: createElement }

function removeCase(word: InflectedWord, corpus: Corpus) {
    let form = FORMS[word.form]

    let clone = new InflectionForm('clone', 'clone', form)
    clone.grammaticalCase = GrammaticalCase.NOM

    let nominative: string = INFLECTION_FORMS[corpus.lang][word.word.pos].allForms.find(
        formId => {
            let form = FORMS[formId]

            if (!form) {
                console.warn(formId + ' is in INFLECTION_FORMS but not FORMS')
                return false
            }

            return FORMS[formId].matches(clone)
        })

    if (nominative) {
        return word.word.inflect(nominative)        
    }
    else {
        console.warn('Could not find nominative of ' + word.form + '.')

        return word.word.getDefaultInflection()
    }
}

let phraseFactComponent = (props: FactComponentProps<PhraseCase>) => {
    let phraseCase: PhraseCase = props.fact

    let phrase = phraseCase.phrase 
    let match = phrase.match({ sentence: props.sentence, words: props.sentence.words, facts: props.corpus.facts })

    let wordString, phraseString

    if (match) {
        phraseString = match.words.map((w) => (
            shouldHideWord(w.word, props.hiddenFacts) ?
                w.word.getEnglish() :
                w.word.jp)).join(' ') 

        let wordToString = (word) =>
            (shouldHideWord(word, props.hiddenFacts) ?
                word.getEnglish() :
                (word instanceof InflectedWord ? removeCase(word, props.corpus).jp : word.jp))

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
        </strong> when used as <strong className='nobr verbatim'>
            { phraseString }
        </strong>

    </div>
}

export default phraseFactComponent;
