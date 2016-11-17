import { AbstractAnyWord } from '../../shared/AbstractAnyWord';
import AnyWord from '../../shared/AnyWord'
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import InflectedWord from '../../shared/InflectedWord'
import * as Dimension from '../../shared/inflection/Dimensions';
import { getDerivations, Derivation, WORD_FORMS } from '../../shared/inflection/WordForms'
import { WordCoordinates, WordForm, NamedWordForm } from '../../shared/inflection/WordForm'

import FactSearchComponent from '../fact/FactSearchComponent'
import openFact from '../fact/openFact'
import OpenTab from '../OpenTab'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    word: AnyWord
    tab: OpenTab
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
                        let derivedWords = props.word.getDerivedWords(derivation.id)

                        return <li key={ derivation.id } >
                            <div className='derivation'>
                                <div className='label'>{ 
                                    derivation.id 
                                }</div> 
                                { 
                                    derivedWords.map(w => 
                                        <div key={ w.getId() } className='word clickable'
                                            onClick={ () => openFact(w.getWordFact(), this.props.corpus, this.props.tab )}>{ 
                                            w.toText() } { w instanceof AbstractAnyWord ? w.classifier : "" 
                                        }</div>)
                                }
                                { 
                                    derivedWords.length ?
                                        <div className='remove button' 
                                            onClick={ 
                                                () => {
                                                    props.corpus.words.removeDerivedWords(props.word, derivation.id, ... derivedWords)
                                                    this.forceUpdate()
                                            }}>Remove</div>
                                    : null
                                }
                                <div className='add button' 
                                    onClick={ () => this.setState({ 
                                        add: (this.state.add != derivation ? derivation : null) }) 
                                    }>Add</div>
                            </div>
                            {
                                this.state.add == derivation ?

                                <FactSearchComponent
                                    corpus={ this.props.corpus }
                                    onFactSelect={ 
                                        (fact) => {
                                            props.corpus.words.addDerivedWords(props.word, derivation.id, fact as AnyWord)

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
                        </li>
                    })
            }
            </ul>
        </div>
    }
}
