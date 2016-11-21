
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'
import Inflection from '../../shared/inflection/Inflection'
import InflectionTableComponent from '../../shared/guide/InflectionTableComponent'
import { renderWordInflection } from '../../shared/guide/InflectionTableComponent'

import Tab from '../OpenTab'
import openFact from '../fact/openFact'
import Word from '../../shared/Word'
import getLanguage from '../getLanguage'

import { Component, createElement } from 'react';
import { INFLECTION_FORMS } from '../../shared/inflection/InflectionForms'
import { MISSING_INDEX } from '../../shared/fact/Facts'

interface Props {
    corpus: Corpus,
    inflection: Inflection,
    tab: Tab,
    word?: InflectableWord,
    onSelect?: (word: Word) => any
    hideForms?: Object
}

interface State {
}

let React = { createElement: createElement }

export default class InflectionsContainerComponent extends Component<Props, State> {    
    addFact(form: string) {
        let fact = this.props.inflection.getFact(form)
        
        this.props.corpus.facts.add(fact)
        
        this.forceUpdate()
    }

    onSelect(form) {
        if (this.props.word && this.props.onSelect) {
            this.props.onSelect(this.props.word.inflect(form))
        }
        else {
            openFact(this.props.inflection.getFact(form), this.props.corpus, this.props.tab)
        }
    }

    render() {
        return <InflectionTableComponent 
            corpus={ this.props.corpus }
            pos={ this.props.inflection.wordForm.pos } 
            mask={ this.props.word ? this.props.word.mask : (form) => !this.props.hideForms[form] }
            renderForm={ renderWordInflection(this.props.word, this.props.corpus, 
                (inflected, form, factIndex) => {
                let className = 'form'

                if (factIndex < MISSING_INDEX) {
                    className += ' clickable'

                    return <div key={ form } className={ className } onClick={ 
                        () => this.onSelect(form) }>
                        { inflected.toText() } 
                        <div className='index'><div className='number'>{ factIndex + 1 }</div></div>
                    </div>
                }
                else {
                    return <div key={ form } className={ className }>{ inflected.toText() }
                        <div className='add' onClick={ () => this.addFact(form) }>
                            <div className='number'>add</div>
                        </div>
                    </div>
                }
            })
        } />
    }
}