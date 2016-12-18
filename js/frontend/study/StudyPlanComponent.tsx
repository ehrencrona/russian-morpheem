
import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import { Topic } from '../../shared/metadata/Topics'

import Fact from '../../shared/fact/Fact'
import FactEntryComponent from '../../shared/guide/entry/FactEntryComponent'
import ExplainFactComponent from '../../shared/guide/fact/FactComponent'

import { Knowledge } from '../../shared/study/Exposure'
import StudentProfile from '../../shared/study/StudentProfile'
import { StudiedFacts } from '../../shared/study/StudyPlan'
import FactScore from '../../shared/study/FactScore'
import { NewFactsSelector } from '../../shared/study/NewFactsSelector'
import { EXPECTED_REPETITIONS_IN_SESSION, FixedIntervalFactSelector } from '../../shared/study/FixedIntervalFactSelector'

import StudyFact from '../../shared/study/StudyFact'
import TopicsComponent from './TopicsComponent'
import FactProgressComponent from './FactProgressComponent'

let React = { createElement: createElement }

interface Props {
    profile: StudentProfile
    corpus: Corpus
    factSelector: FixedIntervalFactSelector
    newFactSelector: NewFactsSelector
    onSubmit: (studiedFacts: StudiedFacts) => any
    onExplain: (fact: StudyFact) => void
    onMarkAsKnown: (fact: Fact) => Promise<any>
}

enum OnTab {
    NEW, REPEAT
}

interface State {
    studiedFacts?: StudiedFacts
    repeatCount?: number
    newCount?: number
    onTab?: OnTab
    showTopics?: boolean
}

const DEFAULT_REPEAT_COUNT = 25
const DEFAULT_NEW_COUNT = 7

export default class StudyPlanComponent extends Component<Props, State> {

    componentWillMount() {
        let studiedFacts: StudiedFacts

        let repeatCount = DEFAULT_REPEAT_COUNT
        let newCount = DEFAULT_NEW_COUNT

        let newFacts = this.props.newFactSelector(false).map(s => s.fact)

        let studyPlan = this.props.profile.studyPlan

        if (studyPlan.isEmpty()) {
            let comparator = (s1, s2) => s2.score - s1.score
            let repeatFacts = this.props.factSelector.chooseFact(new Date()).sort(comparator).map(s => s.fact)

            studiedFacts = this.addQueuedFacts(studyPlan.getQueuedFacts(), new StudiedFacts(newFacts, repeatFacts))

            repeatCount = Math.min(repeatCount, studiedFacts.repeatedFacts.length)
            newCount = Math.min(newCount, studiedFacts.newFacts.length)
        }
        else {
            studiedFacts = studyPlan.getFacts()

            repeatCount = studiedFacts.repeatedFacts.length
            newCount = studiedFacts.newFacts.length

            studiedFacts.newFacts = eliminateDuplicates(studiedFacts.newFacts.concat(newFacts))
        }

        this.setState({  
            studiedFacts: studiedFacts,
            repeatCount: repeatCount,
            newCount: newCount,
            onTab: OnTab.NEW,
        })
    }

    remove(fact: Fact) {
        let studiedFacts = this.state.studiedFacts

        let newFacts = studiedFacts.newFacts.filter(f => f.getId() != fact.getId())
        let repeatedFacts = studiedFacts.repeatedFacts.filter(f => f.getId() != fact.getId()) 

        this.setState({
            studiedFacts: new StudiedFacts(
                newFacts, repeatedFacts),
            repeatCount: Math.min(this.state.repeatCount, repeatedFacts.length),
            newCount: Math.min(this.state.newCount, newFacts.length)
        })

        this.props.onMarkAsKnown(fact);
    }

    renderProgress(fact: Fact) {
        return <FactProgressComponent factSelector={ this.props.factSelector } fact={ fact }/>
    }

    renderFacts(facts: Fact[]) {

        return <ul>{ facts.map(fact => {

            return <li key={ fact.getId() }>
                { this.renderProgress(fact) }
                <div className='fact' onClick={ (e) => { 
                    this.props.onExplain({ fact: fact, words: [] })
                    e.stopPropagation()
                }}>
                    <FactEntryComponent
                        corpus={ this.props.corpus }
                        knowledge={ this.props.profile.knowledge } 
                        fact={ fact }
                        /> 
                </div>
                <div className='button remove' onClick={ (e) => { 
                    this.remove(fact)
                    e.stopPropagation()
                }}>I know</div>
            </li>

        }) }</ul>

    }

    changeCount(countProperty: string, by: number) {
        let state = this.state

        state[countProperty] = state[countProperty] + by

        this.setState(state)
    }

    addQueuedFacts(facts: Fact[], studiedFacts: StudiedFacts): StudiedFacts {
        let newFacts = studiedFacts.newFacts
        let repeatFacts = studiedFacts.repeatedFacts

        facts.reverse().forEach(f => {
            if (this.props.profile.knowledge.getKnowledge(f) != Knowledge.KNEW) {
console.log(f.getId() + ' should be studied')
                newFacts = [ f ].concat(newFacts)
            }
            else if (this.props.factSelector.isEverStudied(f)) {
console.log(f.getId() + ' can be repeated')
                repeatFacts = [ f ].concat(repeatFacts)
            }
            else {
console.log(f.getId() + ' is already known')
            }
        })
        
        return new StudiedFacts(
            eliminateDuplicates(newFacts), 
            eliminateDuplicates(repeatFacts))
    }

    selectTopic(topic: Topic) {
        this.props.profile.studyPlan.queueFacts(topic.getFacts())

        this.setState({ 
            studiedFacts: 
                this.addQueuedFacts(topic.getFacts(), this.state.studiedFacts)
        })
    }

    render() {
        if (this.state.showTopics) {
            return <TopicsComponent 
                corpus={ this.props.corpus }
                factSelector={ this.props.factSelector } 
                onCancel={ () => 
                    this.setState({ showTopics: false }) 
                } 
                onSelect={ (topic) => {
                    this.selectTopic(topic)
                    this.setState({ showTopics: false })

                    ga('send', 'event', 'study', 'topic', topic.id)
                } } />
        }

        let tab = (tab: OnTab, label: string) => {
            return <div className={ 'tab' + (this.state.onTab == tab ? ' current' : ' other') } 
                onClick={ () => this.setState({onTab: tab}) }><div>{ label }</div></div>
        }

        let counter = this.state.onTab == OnTab.NEW ? 'newCount' : 'repeatCount'
        let studiedFacts = this.state.studiedFacts

        let skip = 3
        
        return <div className='studyPlan'>
            <div className='content'>
                <div className='tabs'>
                    { tab(OnTab.NEW, 'New') }
                    { tab(OnTab.REPEAT, 'Repeat') }
                </div>

                <div className='scroll'>
                    { 
                        this.renderFacts(
                            this.state.onTab == OnTab.NEW ?
                                studiedFacts.newFacts.slice(0, this.state.newCount) :
                                studiedFacts.repeatedFacts.slice(0, this.state.repeatCount))
                    }
                
                    <div className='moreOrLess'>
                        { 
                            this.state[counter] > skip ?
                                <div className='less' onClick={ 
                                    () => this.changeCount(counter, -skip) }>
                                    <svg viewBox='0 0 24 21'>
                                        <path d="M 0 21 L 24 21 L 12 0 z" />
                                    </svg>
                                </div>
                                :
                                null
                        }
                        {
                            this.state[counter] < (this.state.onTab == OnTab.NEW ? studiedFacts.newFacts.length : studiedFacts.repeatedFacts.length) ?
                                <div className='more' onClick={ 
                                    () => this.changeCount(counter, skip) }>
                                    <svg viewBox='0 0 24 21'>
                                        <path d="M 0 0 L 24 0 L 12 21 z" />
                                    </svg>
                                </div>
                                :
                                null
                        }
                    </div>
                </div>

                <div className='explain'>

                    <div className='content'>

                        Review the facts to study today.
                        If there are facts you already know well, 
                        use "I know" to remove them.

                        You don't need to memorize everything now; you 
                        can do that during the session. 

                    </div>

                    <div className='button topics' onClick={ () => { this.setState({ showTopics: true }) } }>

                        Choose another topic 

                    </div> 
                </div>

                <div className='button done' onClick={ 
                    () => {
                        this.props.onSubmit(new StudiedFacts(
                            studiedFacts.newFacts.slice(0, this.state.newCount),
                            studiedFacts.repeatedFacts.slice(0, this.state.repeatCount)
                        ))

                        ga('send', 'event', 'study', 'plan')
                    }
                }>Done</div>
            </div>
        </div>
    }
}

function eliminateDuplicates(facts: Fact[]): Fact[] {
    let result = []
    let seen = new Set<string>()

    facts.forEach(f => {
        if (!seen.has(f.getId())) {
            result.push(f)
            seen.add(f.getId())
        }
    })

    return result
}