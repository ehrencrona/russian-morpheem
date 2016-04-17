/// <reference path="../../typings/react/react.d.ts" />

import {Component, cloneElement, createElement} from 'react';
import Facts from './FactsComponent';
import Sentence from './SentenceComponent';
import Corpus from '../shared/Corpus';

let lastTabId = 0

export class Tab {
    constructor(public name: string, public id: string, public element: any, public tabSet: TabSetComponent) {
        this.name = name
        this.id = id
        this.element = element
        this.tabSet = tabSet
    }

    openTab(element, name:string, id: string) {
        this.tabSet.openTab(element, name, id, this) 
    }
}

interface Props {
    corpus: Corpus
}

interface State {
    tabs?: Tab[],
    first?: number
}

let React = { createElement: createElement }

export default class TabSetComponent extends Component<Props, State> {
    constructor(props) {
        super(props)
        
        let sentence = this.props.corpus.sentences.sentences[40]
        
        this.state = {
            tabs: [
                new Tab('Facts', 'facts',
                    <Facts corpus={ this.props.corpus } tab={ null }></Facts>, this),
                new Tab(sentence.toString(), sentence.getId().toString(),
                    <Sentence corpus={ this.props.corpus } tab={ null } sentence={ sentence }/>, this)
            ],
            first: 0
        }
    }

    openTab(element, name: string, id: string, after: Tab) {
        let newTabs = this.state.tabs
        let tab = newTabs.find((tab) => tab.id == id)
        
        if (tab) {
            newTabs = newTabs.filter((tab) => tab.id !== id)
        }

        let i = newTabs.findIndex((tab) => tab === after)

        if (!tab) {
            tab = new Tab(name, id, element, this)
        }

        newTabs.splice(i+1, 0, tab)

        this.setState({
            first: i,
            tabs: newTabs
        })
    }
    
    close(index) {
        return (e) => {
            this.state.tabs.splice(index, 1)
            this.setState({ 
                tabs: this.state.tabs,
                first: this.state.first + 
                    (index <= this.state.first && this.state.first > 0 ? -1 : 0) 
            })
            e.stopPropagation()
        }
    }

    render() {
        let toClosedTab = (offset, addToFirst) => (tab, index) => 
            <div className='tab tab-header' key={tab.id}
                onClick={ () => {
                    let state = this.state
                    state.first = index + offset + addToFirst
                    this.setState(state)
                }}>
                <div className='tab-name'>{ tab.name }</div>
                <div className='tab-close' onClick={ this.close(index + offset) }>Close</div>
            </div>

        return (
            <div>
                <div className='closedTabs'>
                    <div className='tabs'>
                        { this.state.tabs.slice(0, this.state.first).map(toClosedTab(0, 0)) }
                    </div>
                    <div className='tabs'>
                        { this.state.tabs.slice(this.state.first+2).map(toClosedTab(this.state.first+2, -1)).reverse() }
                    </div>
                </div>
                
                <div className='openTabs'>
                { this.state.tabs.slice(this.state.first, this.state.first+2).map(
                    (tab, index) => <div className='tab' key={ tab.id }>
                        <div className='tab-header'>
                            <div className='tab-name'>{ tab.name }</div>
                            <div className='tab-close' onClick={ this.close(this.state.first + index) }>Close</div>
                        </div>
                        { 
                        cloneElement(tab.element, { tab: tab })  
                        }
                    </div>
                ) }
                </div>
            </div>
        )
    }
}
