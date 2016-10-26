

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import InflectableWord from '../../shared/InflectableWord'
import Inflection from '../../shared/inflection/Inflection'
import Tab from '../OpenTab'

import InflectionsContainerComponent from './InflectionsContainerComponent'
import { Component, createElement } from 'react';
import { FactSentences } from '../../shared/SentencesByFactIndex'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    word: InflectableWord,
    tab: Tab,
    onChange?: () => any 
}

interface State {
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

    inflectionClicked(inflection: Inflection) {
        this.props.tab.openTab(
            <InflectionsContainerComponent 
                corpus={ this.props.corpus } 
                tab={ this.props.tab } 
                inflection={ inflection }/>, 
            inflection.getId(), inflection.getId())
    }

    render() {
        let wordsByForm: { [ form:string]: string}
        let forms: string[]

        let inflection = this.props.word.inflection
        let word: InflectableWord = this.props.word
        
        return (
            <div className='inflections'>
                <div className='inflectionName'>
                    inflects as&nbsp;
                    
                    <span className='name clickable' onClick={ () => this.inflectionClicked(inflection) }>
                        { inflection.id }
                        { (inflection.pos ? ' (' + inflection.pos + ')' : '') }
                    </span>
                </div>
            </div>)
    }
}