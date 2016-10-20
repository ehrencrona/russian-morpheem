

import { Component, createElement } from 'react'
import Corpus from '../../../shared/Corpus'

import InflectedWord from '../../../shared/InflectedWord'
import { getFormName, INFLECTION_FORMS, FORMS, CASES, GENDERS, NUMBERS } from '../../../shared/inflection/InflectionForms' 
import InflectionFact from '../../../shared/inflection/InflectionFact'
import PhraseCase from '../../../shared/phrase/PhraseCase'

import { FactComponentProps } from './StudyFactComponent'

let React = { createElement: createElement }

export default function inflectionFactComponent(props: FactComponentProps<InflectionFact>) {
    let studyWord = props.studyFact.words[0]
    let word = studyWord.word
    let form = FORMS[props.fact.form]

    let hideWord = props.hiddenFacts.find((fact) => fact.fact.getId() == word.getId())

    if (word instanceof InflectedWord) {
        // if we are not allowed to name the case, show an inflection table.
        if (!!props.hiddenFacts.find((fact) => fact.fact instanceof PhraseCase && fact.words.indexOf(studyWord) >= 0)) {

            let allForms = INFLECTION_FORMS[props.corpus.lang][word.word.inflection.pos].allForms

            let thisForm = FORMS[word.form]

            let number = thisForm.number
            let gender = thisForm.gender

            let relevantForms = allForms.filter((testForm) => {
                if (FORMS[testForm].grammaticalCase == null) {
                    return
                }

                if (FORMS[testForm].number != null && number != null && FORMS[testForm].number != number) {
                    return false
                } 

                if (FORMS[testForm].gender != null && gender != null && FORMS[testForm].gender != gender) {
                    return false
                } 

                return true
            })

            return <div>
                <strong className='nobr'>{ 
                    hideWord ? studyWord.getHint() : word.word.getDefaultInflection().jp  
                }</strong> inflects as follows {

                    (gender != null || number != 0 ?
                        <span> in the <strong>{
                        ( 
                            (gender != null ? FORMS[GENDERS[gender]].name + ' ' : '') +
                            (number != null ? FORMS[NUMBERS[number]].name : '')
                        )
                        }</strong></span>
                        : <span/>
                    )

                }:
                
                <ul>
                    {
                        relevantForms.map((form) => {

                            return <li key={form}>
                                { FORMS[CASES[FORMS[form].grammaticalCase]].name }: -<strong>{ 
                                    (word as InflectedWord).word.inflection.getInflectedForm('', form).form 
                                }</strong>
                            </li>
                        })
                    }
                </ul>
            </div>

        }
        // if we are not allowed to name the word, just show the english word and name the suffix
        else if (hideWord) {
            return <div>
                <strong className='nobr'>{ 
                    studyWord.getHint() 
                }</strong> forms the <strong className='nobr'>{ 
                    form.name
                }</strong> with the ending <strong className='nobr'>-{
                    word.word.inflection.getInflectedForm('', word.form).form
                }</strong>
            </div>
        }
        // but in normal circumstances we just state the inflection form, the case and the default form
        else {
            let desc = <div><strong className='nobr'>
            </strong>the { form.name } of <strong className='nobr'>
                { word.word.getDefaultInflection().jp }
            </strong> is <strong className='nobr verbatim'>
                { studyWord.jp }
            </strong></div>  
    
            return <div>
                { desc }
            </div>
        }
    }
    else {
        console.warn(word + ' was not inflected, yet InflectionFactComponent got it.')

        return <div/>
    }
}

