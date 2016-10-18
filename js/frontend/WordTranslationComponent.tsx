
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

interface State {
    translationCount: number
}

export default class WordTranslationComponent extends Component<Props, State> {

    constructor(props: Props) {
        super(props)

        this.state = {
            translationCount: props.word.getTranslationCount()
        }
    }

    render() {
        let props = this.props

        let setValue = (form: string, translationIndex: number) => {
            return (e) => {
                let value = (e.target as HTMLInputElement).value

                if (value != props.word.getEnglish(form)) {
                    props.corpus.words.setEnglish(value, props.word, form, translationIndex) 
                }
            } 
        }

        let translationIndices = []

        for (let i = 0; i < this.state.translationCount; i++) {
            translationIndices.push(i)
        }

        return <div className='wordTranslation'>
            <h3>Translation</h3>

            {
                translationIndices.map(translationIndex => {
                    return <div key={ translationIndex }>
                        <input type='text' autoCapitalize='off' 
                            defaultValue={ props.word.getEnglish('', translationIndex) } 
                            onBlur={ setValue('', translationIndex) }/>
                        {
                            ENGLISH_FORMS_BY_POS[props.word.pos] ?

                            ENGLISH_FORMS_BY_POS[props.word.pos].allForms.map((form) => 
                                <div key={ form + translationIndex } className='form'>
                                    <div className='label'>{ form }</div>

                                    <input type='text'
                                        autoCapitalize='off' 
                                        defaultValue={ props.word.getEnglish(form, translationIndex) } 
                                        onBlur={ setValue(form, translationIndex) }/>
                                </div>
                            )

                            :

                            null
                        }
                    </div>
                })
            }

            <div className='button' onClick={ () => this.setState({ translationCount: this.state.translationCount+1} )}>
                Add
            </div>
        </div> 
    }
} 