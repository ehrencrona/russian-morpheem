/// <reference path="../../typings/react/react.d.ts" />

import {Component, cloneElement, createElement} from 'react'
import Facts from './fact/FactsComponent'
import StatsComponent from './StatsComponent'
import Fact from './fact/FactComponent'
import Sentence from './SentenceComponent'
import Corpus from '../shared/Corpus'
import Tab from './Tab'
import TabComponent from './TabComponent'
import SentencesComponent from './sentence/SentencesComponent'
import PhrasesComponent from './sentence/PhrasesComponent'

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
    lock: any
    
    constructor(props) {
        super(props)
        
        let lastString = localStorage.getItem('lastTabIds')
        
        if (lastString) {
            this.lastTabIds = JSON.parse(lastString)
        }

        let state: State = {
            tabs: [],
            first: 0
        } 
        
        try {
            state = this.restoreState(props.corpus) || state
        }
        catch (e) {
            console.error(e.stack)
        }

        this.addStandardTabs(state)

        if (document.location.hash) {
            let sentenceId = parseInt(document.location.hash.substr(1))

            let tabIndex = state.tabs.findIndex((tab) => tab.id == sentenceId.toString())

            if (tabIndex < 0 && !isNaN(sentenceId)) {
                let tab = this.createTabForSentence(sentenceId, this.props.corpus)

                if (tab) {
                    tabIndex = state.tabs.length
                    state.tabs.push(tab)
                }
            }

            if (tabIndex >= 0) {
                state.first = Math.max(tabIndex - 1, 0)
            }
        }

        this.state = state
    }

    addStandardTabs(state: State) {
        if (!state.tabs.find((tab) => tab.id == 'facts')) {
            state.tabs.push(this.createFactsTab())
        }

        if (!state.tabs.find((tab) => tab.id == 'sentences')) {
            state.tabs.push(this.createSentencesTab())
        }

        if (!state.tabs.find((tab) => tab.id == 'stats')) {
            state.tabs.push(this.createStatsTab())
        }

        if (!state.tabs.find((tab) => tab.id == 'phrases')) {
            state.tabs.push(this.createPhrasesTab())
        }
    }

    componentDidUpdate() {
        this.storeTabState()
    }

    createTabForSentence(id: number, corpus: Corpus) {
        let sentence = corpus.sentences.get(id)

        if (!sentence) {
            alert('This sentence seems to have been deleted.')
        }
        else {
            return new Tab(sentence.toString(), id.toString(),
                <Sentence corpus={ corpus } sentence={ sentence } tab={null} />, this)
        }
    }

    restoreState(corpus: Corpus): State {
        let stateJson = JSON.parse(localStorage.getItem('tabState'))

        if (!stateJson) {
            return
        }

        let tabIds: string[] = stateJson.tabs || [] 

        let tabs = tabIds.map((id) => {
            let fact = corpus.facts.get(id)

            if (fact) {
                return new Tab(fact.toString(), fact.getId(), 
                    <Fact corpus={ corpus } tab={ null } fact={ fact }/>, this)
            }

            let numericalId = parseInt(id)

            if (!isNaN(numericalId)) {
                return this.createTabForSentence(numericalId, corpus)
            }

            if (id == 'facts') {
                return this.createFactsTab()
            }

            if (id == 'stats') {
                return this.createStatsTab()
            }

            if (id == 'sentences') {
                return this.createSentencesTab()
            }

            if (id == 'phrases') {
                return this.createPhrasesTab()
            }

            console.warn('Could not build tab ' + id)

            return null
        }).filter((tab) => !!tab)

        return {
            tabs: tabs,
            first: stateJson.first || 0
        }
    }

    createFactsTab() {
        return new Tab('Facts', 'facts',
                <Facts corpus={ this.props.corpus } tab={ null }></Facts>, this)
    }

    createSentencesTab() {
        return new Tab('Sentences', 'sentences',
            <SentencesComponent corpus={ this.props.corpus } tab={ null } ></SentencesComponent>, this)
    }

    createStatsTab() {
        return new Tab('Stats', 'stats',
            <StatsComponent corpus={ this.props.corpus } tab={ null } ></StatsComponent>, this)
    }

    createPhrasesTab() {
        return new Tab('Phrases', 'phrases',
            <PhrasesComponent corpus={ this.props.corpus } tab={ null } ></PhrasesComponent>, this)
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
console.log('close', index)
            this.state.tabs.splice(index, 1)
            this.setState({ 
                tabs: this.state.tabs,
                first: this.state.first + 
                    (index <= this.state.first && this.state.first > 0 ? -1 : 0) 
            })
            e.stopPropagation()
        }
    }

    storeTabState() {
        localStorage.setItem('tabState', JSON.stringify({
            first: this.state.first,
            tabs: this.state.tabs.map((tab) => tab.id)
        }))
    }

    getVisibleTabs() {
        return this.state.tabs.slice(this.state.first, this.state.first+2);
    }
    
    closeAll() {
        let currentFirst = this.state.tabs[this.state.first].id
        let currentSecond = this.state.tabs[this.state.first].id

        let state: State = {
            tabs: this.state.tabs.filter((t) => ['facts', 'stats', 'sentences', 'phrases' ].indexOf(t.id) >= 0),
            first: 0
        }

        state.first = this.state.tabs.findIndex((t) => t.id == currentFirst)

        if (state.first < 0) {
            state.first = this.state.tabs.findIndex((t) => t.id == currentSecond) - 1

            if (state.first < 0) {
                state.first = 0
            }
        }

        this.addStandardTabs(state)

        this.setState(state)
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

        let left = this.state.tabs[this.state.first]
        let right = this.state.tabs[this.state.first+1]

        return (
            <div>
            <div className='tabSet'>
                <div className='column'>
                    <div className='closedTabs'>
                        { this.state.tabs.slice(0, this.state.first).map(toClosedTab(0, 0)) }
                    </div>
                    <div className='openTabs'>
                        { left ?
                            <TabComponent 
                                key={ left.id }
                                corpus={ this.props.corpus }
                                tab={ left } 
                                close={ this.close(this.state.first) }/>
                                :
                            <div/>
                        }
                    </div>
                </div>
                <div className='column'>
                    <div className='closeAll' onClick={ () => this.closeAll() }>Close All</div>
                    <div className='closedTabs'>
                        { this.state.tabs.slice(this.state.first+2).map(toClosedTab(this.state.first+2, -1)).reverse() }
                    </div>
                    <div className='openTabs'>
                        { right ?
                            <TabComponent 
                                key={ right.id }
                                corpus={ this.props.corpus }
                                tab={ right } 
                                close={ this.close(this.state.first+1) }/>
                                :
                            <div/>
                        }
                    </div>
                </div>
            </div>
            </div>
        )
    }
}
