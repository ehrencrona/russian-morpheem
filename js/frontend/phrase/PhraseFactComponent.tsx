

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Tab from '../OpenTab'
import MoveFactButton from '../MoveFactButtonComponent'
import DeleteFactButton from '../DeleteFactButtonComponent'
import TagButton from '../TagButtonComponent'
import SentencesWithFact from '../SentencesWithFactComponent'
import AddSentenceToPhraseComponent from './AddSentenceToPhraseComponent'
import PhrasePatternComponent from './PhrasePatternComponent'
import PhraseSentencesComponent from './PhraseSentencesComponent'
import isConflictFunction from './isConflict'

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'
import Phrase from '../../shared/phrase/Phrase'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: Phrase,
    tab: Tab
}

interface State {
    tab?: string,
    includeConflicts?: boolean
}

let React = { createElement: createElement }

export default class PhraseFactComponent extends Component<Props, State> {

    constructor(props) {
        super(props)
        
        this.state = {
            tab: 'sentences',
            includeConflicts: false
        }
    }

    render() {
        let fact = this.props.fact

        let tabButton = (id, name) =>
            <div className={ 'button ' + (this.state.tab == id ? ' selected' : '') } 
                onClick={ () => { this.setState({ tab: id }) }}>{ name }</div>

        let tab;    

        if (this.state.tab == 'sentences') {
            tab = <div>
                <h3>Sentences</h3>

                <PhraseSentencesComponent 
                    corpus={ this.props.corpus }
                    patterns={ fact.patterns }
                    tab={ this.props.tab }
                    filter={ (sentence) => !!sentence.hasPhrase(fact) }
                    isConflict={ isConflictFunction(this.props.fact, this.props.corpus.facts) }
                    includeConflicts={ true }
                    noMatchIsConflict={ true }
                    ref='sentences'
                    buttonFactory={ (sentence) => 
                        <div className='button' onClick={ 
                            () => { 
                                this.props.corpus.sentences.removePhrase(fact, sentence);

                                (this.refs['sentences'] as Component<any, any>).forceUpdate() 
                        } } >Remove</div>
                    }
                />
            </div>
        }
        else {
            tab = <AddSentenceToPhraseComponent 
                corpus={ this.props.corpus } 
                phrase={ fact } 
                tab={ this.props.tab } 
            /> 
        }

        return (<div className='phrase'>

            <div className='buttonBar'>                
                { tabButton('sentences', 'Sentences') }
                { tabButton('find', 'Matching') }
                <MoveFactButton corpus={ this.props.corpus} 
                    fact={ this.props.fact }
                    onMove={ () => (this.refs['sentencesWithFact'] as SentencesWithFact).forceUpdate() } 
                    />

                <DeleteFactButton corpus={ this.props.corpus} fact={ this.props.fact } 
                    onDelete={ () => this.props.tab.close() }/>

                <TagButton corpus={ this.props.corpus} fact={ this.props.fact } />
                <div className='factId'>
                    { this.props.fact.id }
                </div>
            </div>

            <PhrasePatternComponent 
                phrase={ this.props.fact } 
                corpus={ this.props.corpus } 
                onChange={ () => { this.forceUpdate() } }
                tab={ this.props.tab }
                />
        
            { tab }
        </div>)
            
    }
}
