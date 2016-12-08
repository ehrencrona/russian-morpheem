

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import FilteredFactsListComponent from '../fact/FilteredFactsListComponent'
import FactSearchComponent from '../fact/FactSearchComponent'

import Tab from '../OpenTab'

import { Topic } from '../../shared/metadata/Topics'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    topic: Topic,
    tab: Tab
}

interface State {
}

let React = { createElement: createElement }

export default class TopicComponent extends Component<Props, State> {

    constructor(props) {
        super(props)
        
        this.state = {
        }
    }

    render() {
        let topic = this.props.topic
        let factSearch, factList

        return <div className='topic'>
            <div className='field'>
                <div className='label'>
                    Name
                </div>
            
                <input type='text' lang={ this.props.corpus.lang } autoCapitalize='off' 
                    defaultValue={ topic.name } 
                    onBlur={ (e) => {
                        let input = e.target as HTMLInputElement
                        
                        if (input.value != topic.name) {
                            topic.name = input.value

                            this.props.corpus.topics.setTopic(topic)
                        }
                    } }/>
            </div>

            <div className='field'>
                <div className='label'>
                    Description
                </div>
            
                <textarea lang={ this.props.corpus.lang } autoCapitalize='off' 
                    defaultValue={ topic.description } 
                    onBlur={ (e) => {
                        let input = e.target as HTMLInputElement
                        
                        if (input.value != topic.description) {
                            topic.description = input.value

                            this.props.corpus.topics.setTopic(topic)
                        }
                    } }/>
            </div>


            <FilteredFactsListComponent
                corpus={ this.props.corpus }
                tab={ this.props.tab }
                filter={ fact => topic.hasFact(fact.fact) }
                ref={ (ws) => factList = ws }
                factEntryChildFactory={
                    (fact) => <div className='button' 
                        onClick={ (e) => { 
                            topic.removeFact(fact) 
                            e.stopPropagation()
                            factList.forceUpdate() 
                        }
                    }>Remove</div>
                }
            />

            <div>
                <FactSearchComponent
                    corpus={ this.props.corpus }
                    ref={ (ws) => factSearch = ws }
                    onFactSelect={ (fact) => {
                        topic.addFact(fact)

                        this.forceUpdate()

                        factSearch.clearFilters()
                    } }
                />
            </div>
        </div>

    }
}
