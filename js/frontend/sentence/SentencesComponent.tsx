

import {Component,createElement} from 'react'
import Corpus from '../../shared/Corpus'

import Tab from '../OpenTab'
import PendingSentencesComponent from './PendingSentencesComponent'
import UntranslatedSentencesComponent from './UntranslatedSentencesComponent'
import UnrecordedSentencesComponent from './UnrecordedSentencesComponent'
import LatestEventsComponent from './LatestEventsComponent'
import NewsfeedComponent from './NewsfeedComponent'
import SentenceComponent from './SentenceComponent'
import SearchSentencesComponent from './SearchSentencesComponent'
import AllSentencesComponent from './AllSentencesComponent'
import Sentence from '../../shared/Sentence'

interface Props {
    corpus: Corpus,
    tab: Tab
}

const ALL = 'all'
const LATEST = 'latest'
const MY_LATEST = 'my-latest'
const PENDING = 'pending'
const NEWSFEED = 'newsfeed'
const SEARCH = 'search'
const UNTRANSLATED = 'untranslated'
const UNRECORDED = 'unrecorded'

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
    
    addSentence() {
        let sentence = new Sentence([ ], null)
        
        this.props.corpus.sentences.add(sentence)
        .then((sentence) => {
            this.props.tab.openTab(
                <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
                sentence.toString(),
                sentence.id.toString()
            )
        })
    }

    render() {
        let filterButton = (id, name) =>
            <div className={ 'button ' + (this.state.list == id ? ' selected' : '') } 
                onClick={ () => { this.setState({ list: id }) }}>{ name }</div>

        let list

        if (this.state.list == NEWSFEED) {
            list = <NewsfeedComponent
                tab={ this.props.tab }
                corpus={ this.props.corpus }
                key='newsfeed'/>
        }
        else if (this.state.list == ALL) {
            list = <AllSentencesComponent
                tab={ this.props.tab }
                corpus={ this.props.corpus }
                key='all'/>
        }
        else if (this.state.list == SEARCH) {
            list = <SearchSentencesComponent
                key='search'
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
        else if (this.state.list == PENDING) {
            list = <PendingSentencesComponent
                corpus={ this.props.corpus }
                tab={ this.props.tab } />
        }
        else if (this.state.list == UNTRANSLATED) {
            list = <UntranslatedSentencesComponent
                corpus={ this.props.corpus }
                tab={ this.props.tab } />
        }
        else if (this.state.list == UNRECORDED) {
            list = <UnrecordedSentencesComponent
                corpus={ this.props.corpus }
                tab={ this.props.tab } />
        }

        return (<div>
                <div className='buttonBar'>
                    <div className='button' onClick={ () => { this.addSentence() }}>+ Sentence</div>

                    { filterButton(NEWSFEED, 'Newsfeed') }
                    { filterButton(SEARCH, 'Search') }
                    { filterButton(ALL, 'All') }
                    { filterButton(LATEST, 'Latest') }
                    { filterButton(MY_LATEST, 'My latest') }
                    { filterButton(UNTRANSLATED, 'Untranslated') }
                    { filterButton(UNRECORDED, 'Unrecorded') }
                    { filterButton(PENDING, 'Pending') }
                </div>

                { list }
            </div>)
    }
}
