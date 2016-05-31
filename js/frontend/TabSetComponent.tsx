/// <reference path="../../typings/react/react.d.ts" />

import {Component, cloneElement, createElement} from 'react';
import Facts from './FactsComponent';
import StatsComponent from './StatsComponent';
import Fact from './FactComponent';
import Sentence from './SentenceComponent';
import Corpus from '../shared/Corpus';
import Tab from './Tab';
import TabComponent from './TabComponent';

interface Props {
    corpus: Corpus
}

interface State {
    tabs?: Tab[],
    first?: number
}

let React = { createElement: createElement }

export default class TabSetComponent extends Component<Props, State> {
    lastTabIds: string[] = []
    
    constructor(props) {
        super(props)
        
        let lastString = localStorage.getItem('lastTabIds')
        
        if (lastString) {
            this.lastTabIds = JSON.parse(lastString)
        }

        this.state = {
            tabs: [
                new Tab('Facts', 'facts',
                    <Facts corpus={ this.props.corpus } tab={ null }></Facts>, this),
                new Tab('Stats', 'stats',
                    <StatsComponent corpus={ this.props.corpus }></StatsComponent>, this)
            ],
            first: 0
        } 
    }

    tabExists(id: string) {
        return this.state.tabs.find((tab) => tab.id == id)
    }

    closeTab(tab: Tab) {
        let i = this.state.tabs.findIndex((existingTab) => tab.id === existingTab.id)

        if (i < 0) {
            throw new Error('Unknown tab.')
        }

        let tabs = this.state.tabs
        
        tabs.splice(i, 1)

        let first = this.state.first
        
        if (i <= this.state.first && first > 0) {
            first--
        }

        this.setState({
            first: first,
            tabs: tabs
        })
    }
    
    openTab(element, name: string, id: string, after: Tab) {
        let newTabs = this.state.tabs
        let tab = newTabs.find((tab) => tab.id == id)

        if (tab) {
            newTabs = newTabs.filter((tab) => tab.id !== id)
        }

        let i = newTabs.findIndex((tab) => tab === after)

        if (i < 0) {
            i = this.state.first
        }

        if (!tab) {
            tab = new Tab(name, id, element, this)
        }

        newTabs.splice(i+1, 0, tab)

        this.setState({
            first: i,
            tabs: newTabs
        })
        
        this.lastTabIds = this.lastTabIds.filter((lastId) => lastId != id)
        this.lastTabIds.push(id)

        if (this.lastTabIds.length > 80) {
            this.lastTabIds.splice(0, this.lastTabIds.length - 80)
        }

        localStorage.setItem('lastTabIds', JSON.stringify(this.lastTabIds))
    }
    
    getLastTabIds(): string[]  {
        return this.lastTabIds
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

    getVisibleTabs() {
        return this.state.tabs.slice(this.state.first, this.state.first+2);
    }
    
    render() {
        let toClosedTab = (offset, addToFirst) => (tab: Tab, index) => {
            let factIndex
            
            let component = tab.component

            if (component.props.fact) {
                factIndex = this.props.corpus.facts.indexOf(component.props.fact) + 1
            }

            return <div className='tab tab-header' key={tab.id}
                onClick={ () => {
                    let state = this.state
                    state.first = index + offset + addToFirst
                    this.setState(state)
                }}>
                <div className='tab-name'>
                { (factIndex ? 
                    
                    <div className='index'><div className='number'>{ factIndex }</div></div>
                    
                    : <div/>) }
                { tab.name }</div>
                <div className='tab-close' onClick={ this.close(index + offset) }>Close</div>
            </div>
        }

        return (
            <div className='tabSet'>
                <div className='closedTabs'>
                    <div className='tabs'>
                        { this.state.tabs.slice(0, this.state.first).map(toClosedTab(0, 0)) }
                    </div>
                    <div className='tabs'>
                        { this.state.tabs.slice(this.state.first+2).map(toClosedTab(this.state.first+2, -1)).reverse() }
                    </div>
                </div>
                
                <div className='openTabs'>
                { this.getVisibleTabs().map(
                    (tab, index) => 
                        <TabComponent 
                            key={ tab.id }
                            corpus={ this.props.corpus }
                            tab={ tab } 
                            close={ this.close(this.state.first + index) }/>
                ) }
                </div>
            </div>
        )
    }
}
