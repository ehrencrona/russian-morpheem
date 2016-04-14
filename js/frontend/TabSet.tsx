/// <reference path="../../typings/react/react.d.ts" />

import {Component, cloneElement, createElement} from 'react';
import Facts from './Facts';
import Corpus from '../shared/Corpus';

let lastTabId = 0

export class Tab {
    constructor(public name: string, public id: string, public element: any, public tabSet: TabSet) {
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
    tabs: Tab[],
    first: number
}

let React = { createElement: createElement }

export default class TabSet extends Component<Props, State> {
    constructor(props) {
        super(props)
        
        this.state = {
            tabs: [
                new Tab('Facts', 'facts',
                    <Facts corpus={ this.props.corpus } tab={ null }></Facts>, this)
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

    render() {
        let toClosedTab = (offset) => (tab, index) => 
            <div className='tab' key={tab.id}
                onClick={ () => {
                    let state = this.state
                    state.first = index + offset
console.log('first', index, offset, state.first)                    
                    this.setState(state)
                }}
            >{ tab.name }</div>
                            
        return (
            <div>
                <div className='closedTabs'>
                    <div className='tabs'>
                        { this.state.tabs.slice(0, this.state.first).map(toClosedTab(0)) }
                    </div>
                    <div className='tabs'>
                        { this.state.tabs.slice(this.state.first+2).map(toClosedTab(this.state.first+1)).reverse() }
                    </div>
                </div>
                
                <div className='openTabs'>
                { this.state.tabs.slice(this.state.first, this.state.first+2).map(
                    (tab) => <div className='tab' key={ tab.id }>{ 
                        cloneElement(tab.element, { tab: tab })  
                    }</div>
                ) }
                </div>
            </div>
        )
    }
}
