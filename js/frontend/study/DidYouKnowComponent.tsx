

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import FixedIntervalFactSelector from '../../shared/study/FixedIntervalFactSelector'
import StudyFactComponent from './fact/StudyFactComponent'
import StudyFact from '../../shared/study/StudyFact'
import Fact from '../../shared/fact/Fact'
import Sentence from '../../shared/Sentence'
import NaiveKnowledge from '../../shared/study/NaiveKnowledge'
import animate from './animate'

interface Props {
    facts: StudyFact[]
    hiddenFacts: StudyFact[]
    sentence: Sentence
    corpus: Corpus
    knowledge: NaiveKnowledge
    factSelector: FixedIntervalFactSelector
    done: (known: StudyFact[], unknown: StudyFact[]) => any    
    factSelected: (fact: StudyFact) => any
    onExplain: (fact: StudyFact) => void
}

interface State {
    selectedFact?: number
    known?: StudyFact[]
    unknown?: StudyFact[]
}

let React = { createElement: createElement }

const ANIMATION_LENGTH = 200

export default class DidYouKnowComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            selectedFact: 0,
            known: [],
            unknown: []
        }
    }

    render() {
        let next = (known: StudyFact[], unknown: StudyFact[]) => {
            animate(this.refs['container'] as HTMLElement, 'leave', ANIMATION_LENGTH, () =>  {
                let selectedFact = this.state.selectedFact

                if (selectedFact >= this.props.facts.length-1) {
                    this.props.done(known, unknown)
                }
                else {
                    this.setState({
                        selectedFact: selectedFact+1,
                        known: known,
                        unknown: unknown,
                    })

                    this.props.factSelected(this.props.facts[selectedFact+1])
                }
            })
        }

        let selectedFact = this.props.facts[this.state.selectedFact]

        let knew = () => {
            next(this.state.known.concat([ selectedFact ]), this.state.unknown)
        }

        let didntKnow = () => {
            next(this.state.known, this.state.unknown.concat([ selectedFact ]))
        }

        return <div className='lowerContainer'>
            <div className='buttons'>
                <div className='button left smallText' onClick={ knew }><span className='line'>I knew</span> this</div>
                <div className='button right smallText' onClick={ didntKnow }><span className='line'>Study this</span> again</div>
            </div>
            <div className='lower'>
                <ul className='didYouKnowFact' ref='container'>
                    <StudyFactComponent 
                        key={ selectedFact.fact.getId() }
                        hiddenFacts={ this.props.hiddenFacts }
                        fact={ selectedFact.fact } 
                        studyFact={ selectedFact } 
                        sentence={ this.props.sentence } 
                        corpus={ this.props.corpus }
                        knowledge={ this.props.knowledge }
                        factSelector={ this.props.factSelector } 
                        onKnew={ (fact: StudyFact) => {} }
                        onExplain={ this.props.onExplain }
                        known={ true }
                    />
                </ul>
            </div>
        </div>
    }

}