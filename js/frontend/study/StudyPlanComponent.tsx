
import { Component, createElement } from 'react'
import StudentProfile from '../../shared/study/StudentProfile'
import { StudiedFacts } from '../../shared/study/StudyPlan'
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import FactEntryComponent from '../guide/fact/FactEntryComponent'
import FixedIntervalFactSelector from '../../shared/study/FixedIntervalFactSelector'
import FactScore from '../../shared/study/FactScore'
import { NewFactsSelector } from '../../shared/study/NewFactsSelector'

let React = { createElement: createElement }

interface Props {
    profile: StudentProfile
    corpus: Corpus
    factSelector: FixedIntervalFactSelector
    newFactSelector: NewFactsSelector
    onSubmit: (studiedFacts: StudiedFacts) => any
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

        if (this.props.profile.studyPlan.isEmpty()) {
            let comparator = (s1, s2) => s2.score - s1.score

            let repeatFacts = this.props.factSelector.chooseFact(new Date()).sort(comparator).map(s => s.fact)

            studiedFacts = new StudiedFacts(newFacts, repeatFacts)

            repeatCount = Math.min(repeatCount, studiedFacts.repeatedFacts.length)
            newCount = Math.min(newCount, studiedFacts.newFacts.length)
        }
        else {
            studiedFacts = this.props.profile.studyPlan.getFacts()

            repeatCount = studiedFacts.repeatedFacts.length
            newCount = studiedFacts.newFacts.length

            studiedFacts.newFacts = studiedFacts.newFacts.concat(newFacts)
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
    }

    renderKnowledge(fact: Fact) {
        return this.props.factSelector.getExpectedRepetitions(fact)
    }

    renderFacts(facts: Fact[]) {

        return <ul>{ facts.map(fact => {

            return <li key={ fact.getId() }>
                <div className='fact'>
                    <FactEntryComponent
                        corpus={ this.props.corpus }
                        knowledge={ this.props.profile.knowledge } 
                        fact={ fact }/> 
                </div>                    
                <div className='knowledge'>{ this.renderKnowledge(fact) }</div>
                <div className='button remove' onClick={ () => this.remove(fact) }>Remove</div>
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
            return <div className={ 'tab' + (this.state.onTab == tab ? ' current' : '') } 
                onClick={ () => this.setState({onTab: tab}) }>{ label }</div>
        }

        let counter = this.state.onTab == OnTab.NEW ? 'newCount' : 'repeatCount'

        return <div className='studyPlan'>
            <h2>Study Plan</h2>

            <div className='tabs'>
                { tab(OnTab.NEW, 'New') }
                { tab(OnTab.REPEAT, 'Repeat') }
            </div>
        
            { 
                this.renderFacts(
                    this.state.onTab == OnTab.NEW ?
                        this.state.studiedFacts.newFacts.slice(0, this.state.newCount) :
                        this.state.studiedFacts.repeatedFacts.slice(0, this.state.repeatCount))
            }
        
            { 
                this.state[counter] > 0 ?
                    <div className='button' onClick={ 
                        () => this.changeCount(counter, -1) }>Less</div>
                    :
                    null
            }
            {
                this.state[counter] < this.state.studiedFacts.repeatedFacts.length ?
                    <div className='button' onClick={ 
                        () => this.changeCount(counter, 1) }>More</div>
                    :
                    null
            }

            <div className='button' onClick={ 
                () => this.props.onSubmit(this.state.studiedFacts) }>Done</div>
        </div>
    }

    submit() {
        let studiedFacts = this.state.studiedFacts

        this.props.profile.studyPlan.setFacts(
            new StudiedFacts(
                studiedFacts.newFacts.slice(0, this.state.newCount),
                studiedFacts.repeatedFacts.slice(0, this.state.repeatCount)
            ), this.props.factSelector)
    }

}
