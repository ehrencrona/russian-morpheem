
import Corpus from '../shared/Corpus'
import Translatable from '../shared/Translatable'
import InflectableWord from '../shared/InflectableWord'
import Word from '../shared/Word'
import { Component, createElement } from 'react';
import { ENGLISH_FORMS_BY_POS } from '../shared/inflection/InflectionForms'

let React = { createElement: createElement }

interface Props {
    word: Word|InflectableWord
    corpus: Corpus
}

export default function WordTranslationComponent(props: Props, children) {

    let setValue = (form: string) => {
        return (e) => {
            let value = (e.target as HTMLInputElement).value

            if (value != props.word.getEnglish(form)) {
                props.corpus.words.setEnglish(value, props.word, form) 
            }
        } 
    }

    return <div className='wordTranslation'>
        <h3>Translation</h3>

        <input type='text' autoCapitalize='off' defaultValue={ props.word.getEnglish() } onBlur={ setValue('') }/>

        {

            (ENGLISH_FORMS_BY_POS[props.word.pos] || []).map((form) => 
                <div key={ form } className='form'>
                    <div className='label'>{form }</div>

                    <input type='text' autoCapitalize='off' 
                            defaultValue={ props.word.en[form] } onBlur={ setValue(form) }/>

                </div>
            )

        }
    </div> 
} 