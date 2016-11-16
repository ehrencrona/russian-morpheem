import AnyWord from '../../shared/AnyWord'
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import InflectedWord from '../../shared/InflectedWord'
import * as Dimension from '../../shared/inflection/Dimensions';
import WORD_FORMS from '../../shared/inflection/WordForms'
import { WordCoordinates, WordForm, NamedWordForm } from '../../shared/inflection/WordForm'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    word: AnyWord
}

interface State {
}

let React = { createElement: createElement }

export default class WordFormComponent extends Component<Props, State> {
    toggle(toggleForm: NamedWordForm) {
        let props = this.props
        let wordForm = props.word.wordForm
        let newForm = new WordForm({})

        if (wordForm.matches(toggleForm)) {
            Object.keys(WORD_FORMS)
                .filter(id => !WORD_FORMS[id].matches(toggleForm) && wordForm.matches(WORD_FORMS[id]))
                .map(id => newForm.add(WORD_FORMS[id]))
        }
        else {
            newForm.add(wordForm)
            newForm.add(toggleForm)
        }

        props.corpus.words.setWordForm(newForm, props.word)
        this.forceUpdate()
    }

    render() {
        let props = this.props
        let wordForm = props.word.wordForm

        return <div>
            <h3>Form</h3>
            <ul className='wordForms'>
            { 
                Object.keys(WORD_FORMS)
                    .filter(id => wordForm.isCompatibleWith(WORD_FORMS[id]))
                    .map(id => 
                        <li key={ id } onClick={ () => this.toggle(WORD_FORMS[id]) } 
                            className={ wordForm.matches(WORD_FORMS[id]) ? 'current' : '' }>{ id }</li>)
            }
            </ul>
        </div>
    }
}
