import { AbstractAnyWord } from '../../shared/AbstractAnyWord';
import AnyWord from '../../shared/AnyWord'
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import InflectedWord from '../../shared/InflectedWord'
import * as Dimension from '../../shared/inflection/Dimensions';
import { getDerivations, Derivation, WORD_FORMS } from '../../shared/inflection/WordForms'
import { WordCoordinates, WordForm, NamedWordForm } from '../../shared/inflection/WordForm'

import FactSearchComponent from '../../frontend/fact/FactSearchComponent'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    word: AnyWord
}

interface State {
    add?: Derivation
}

let React = { createElement: createElement }

export default class WordDerivationsComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {}
    }

    render() {
        let props = this.props
        let wordForm = props.word.wordForm

        return <div>
            <h3>Derived Words</h3>
            <ul className='wordDerivations'>
            { 
                getDerivations(props.word.wordForm)
                    .map(derivation => {
                        return <li key={ derivation.id } >
                            <div className='derivation'>{ 
                                    derivation.id 
                                }</div> 
                            { 
                                props.word.getDerivedWords(derivation.id).map(w => 
                                    <div key={ w.getId() } className='word'>{ 
                                        w.toText() } { w instanceof AbstractAnyWord ? w.classifier : "" 
                                    }</div>)
                            }
                            {
                                this.state.add == derivation ?

                                <FactSearchComponent
                                    corpus={ this.props.corpus }
                                    onFactSelect={ 
                                        (fact) => {
                                            props.corpus.words.setDerivedWords(props.word, derivation.id, 
                                                props.word.getDerivedWords(derivation.id).concat(fact as AnyWord))

                                            this.forceUpdate()
                                        }
                                    } 
                                    filter={ 
                                        (fact) => fact instanceof AbstractAnyWord && 
                                            fact.wordForm.matches(derivation.toForm) 
                                    }
                                />

                                : 
                                null
                            }
                            <div className='add button' 
                                onClick={ () => this.setState({ add: derivation }) }>Add</div>
                        </li>
                    })
            }
            </ul>
        </div>
    }
}
