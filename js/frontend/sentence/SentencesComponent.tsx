/// <reference path="../../../typings/react/react.d.ts" />

import {Component,createElement} from 'react'
import Corpus from '../../shared/Corpus'

import Tab from '../Tab'
import PendingSentencesComponent from './PendingSentencesComponent'
import LatestEventsComponent from './LatestEventsComponent'
import NewsfeedComponent from './NewsfeedComponent'

interface Props {
    corpus: Corpus,
    tab: Tab
}

const LATEST = 'latest'
const MY_LATEST = 'my-latest'
const PENDING = 'pending'
const NEWSFEED = 'newsfeed'

interface State {
    list?: string,
}

let React = { createElement: createElement }

export default class SentencesComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            list: NEWSFEED
        }
    }
    
    render() {
        let filterButton = (id, name) =>
            <div className={ 'button ' + (this.state.list == id ? ' selected' : '') } 
                onClick={ () => { this.setState({ list: id }) }}>{ name }</div>

        let list

        if (this.state.list == PENDING) {
            list = <PendingSentencesComponent
                corpus={ this.props.corpus }
                tab={ this.props.tab } />
        }
        else if (this.state.list == LATEST) {
            list = <LatestEventsComponent
                key='latest'
                my={ false }
                corpus={ this.props.corpus }
                tab={ this.props.tab } />
        }
        else if (this.state.list == MY_LATEST) {
            list = <LatestEventsComponent
                key='my-latest'
                my={ true }
                corpus={ this.props.corpus }
                tab={ this.props.tab } />
        }
        else if (this.state.list == NEWSFEED) {
            list = <NewsfeedComponent
                tab={ this.props.tab }
                corpus={ this.props.corpus }
                key='newsfeed'/>
        }

        return (<div>
                <div className='buttonBar'>
                    <div>
                        { filterButton(NEWSFEED, 'Newsfeed') }
                        { filterButton(LATEST, 'Latest') }
                        { filterButton(MY_LATEST, 'My latest') }
                        { filterButton(PENDING, 'Pending') }
                    </div>
                </div>

                { list }
            </div>)
    }
}
