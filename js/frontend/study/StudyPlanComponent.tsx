
import { Component, createElement } from 'react'
import StudentProfile from '../../shared/study/StudentProfile'
import { StudiedFacts } from '../../shared/study/StudyPlan'
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import FactEntryComponent from '../guide/fact/FactEntryComponent'
import { EXPECTED_REPETITIONS_FOR_NEW, FixedIntervalFactSelector } from '../../shared/study/FixedIntervalFactSelector'
import FactScore from '../../shared/study/FactScore'
import { NewFactsSelector } from '../../shared/study/NewFactsSelector'

let React = { createElement: createElement }

interface Props {
    profile: StudentProfile
    corpus: Corpus
    factSelector: FixedIntervalFactSelector
    newFactSelector: NewFactsSelector
    onSubmit: (studiedFacts: StudiedFacts) => any
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

            newFacts = studyPlan.getQueuedFacts().concat(newFacts);

            studiedFacts = new StudiedFacts(newFacts, repeatFacts)

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
            onTab: OnTab.NEW
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
        let percentage = 100 * Math.max(1 - this.props.factSelector.getExpectedRepetitions(fact) / EXPECTED_REPETITIONS_FOR_NEW, 0)

        return <div className='progress'>
            <div className='barContainer'>
                <div className={ 'start' + (percentage == 0 ? ' empty' : '')}>&nbsp;</div>
            
                <div className='bar'>
                    <div className='full' style={ { width: percentage + '%' }}>&nbsp;</div>
                </div>

                <div className={ 'end'  + (percentage == 100 ? ' full' : '') }>&nbsp;</div>
            </div>
        </div>
    }

    renderFacts(facts: Fact[]) {

        return <ul>{ facts.map(fact => {

            return <li key={ fact.getId() }>
                { this.renderProgress(fact) }
                <div className='fact'>
                    <FactEntryComponent
                        corpus={ this.props.corpus }
                        knowledge={ this.props.profile.knowledge } 
                        fact={ fact }/> 
                </div>
                <div className='button remove' onClick={ () => this.remove(fact) }>I know</div>
            </li>

        }) }</ul>

    }

    changeCount(countProperty: string, by: number) {
        let state = this.state

        state[countProperty] = state[countProperty] + by

        this.setState(state)
    }

    render() {
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

                <div className='button done' onClick={ 
                    () => this.props.onSubmit(new StudiedFacts(
                        studiedFacts.newFacts.slice(0, this.state.newCount),
                        studiedFacts.repeatedFacts.slice(0, this.state.repeatCount)
                    )) }>Done</div>
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