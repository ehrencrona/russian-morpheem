/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'
import InflectableWord from '../shared/InflectableWord'
import Inflection from '../shared/Inflection'
import Tab from './Tab'

import InflectionsComponent from './InflectionsComponent'
import { Component, createElement } from 'react';
import { FactSentences } from '../shared/IndexSentencesByFact'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    word: InflectableWord,
    tab: Tab,
    onChange?: () => any 
}

interface State {
    inflection?: Inflection,
    change?: boolean
}

export default class ChangeInflectionComponent extends Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = {
            inflection: props.word.inflection
        }
    }
    
    componentWillReceiveProps(newProps) {
        this.setState({
            inflection: newProps.word.inflection
        })    
    }

    changeInflection(inflection: Inflection) {
        this.props.corpus.words.changeInflection(this.props.word, inflection)

        this.setState({
            inflection: inflection
        })
        
        if (this.props.onChange) {
            this.props.onChange()
        }
    }

    inflectionClicked(inflection: Inflection) {
        this.props.tab.openTab(
            <InflectionsComponent 
                corpus={ this.props.corpus } 
                tab={ this.props.tab } 
                inflection={ inflection }/>, 
            inflection.getId(), inflection.getId())
    }

    render() {
        let wordsByForm: { [ form:string]: string}
        let forms: string[]

        let inflection = this.state.inflection
        let word: InflectableWord = this.props.word
        
        let alternativeInflections
        
        try {
            alternativeInflections = 
                this.props.corpus.inflections.getPossibleInflections(
                        this.props.word.getDefaultInflection().jp)
                    .filter((inflection) => inflection.getId() != this.state.inflection.getId())
                    .filter((inflection) => inflection.pos == this.state.inflection.pos)
                    .filter((inflection) => inflection.getEnding(inflection.defaultForm) ==
                        this.state.inflection.getEnding(inflection.defaultForm))
        }
        catch (e) {
            // no default form.
            alternativeInflections = []
        }
        
        return (
            <div className='inflections'>
                <div className='inflectionName'>
                    inflects as&nbsp;
                    
                    <span className='name'>
                        { inflection.id }
                        { (inflection.pos ? ' (' + inflection.pos + ')' : '') }
                    </span>
    
                    { (this.props.word && alternativeInflections.length ? 
                        <div className='button' onClick={ () => this.setState({ change: !this.state.change })}>
                            { (this.state.change ? 'Done' : 'Change') }</div>
                        :
                        <div/>) }
                </div>
                { (this.state.change ?
                   
                    <div className='buttonBar'>{
                        alternativeInflections.map((inflection) =>
                            <div className='button' key={ inflection.getId() } 
                                onClick={ () => { this.changeInflection(inflection) } }>{ inflection.getId()
                                    + (inflection.pos ? ' (' + inflection.pos + ')' : '')    
                                }</div>
                        )
                    }</div>

                :

                <div/>
                   
                ) }
            </div>)
    }
}