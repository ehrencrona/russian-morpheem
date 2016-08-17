

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import StudyFactComponent from './fact/StudyFactComponent'
import StudyFact from './StudyFact'
import Fact from '../../shared/fact/Fact'
import Sentence from '../../shared/Sentence'
import NaiveKnowledge from '../../shared/study/NaiveKnowledge'

interface Props {
    facts: StudyFact[]
    hiddenFacts: StudyFact[]
    sentence: Sentence
    corpus: Corpus
    knowledge: NaiveKnowledge
    done: (known: StudyFact[], unknown: StudyFact[]) => any    
    factSelected: (fact: StudyFact) => any
}

interface State {
    selectedFact: number
    known: StudyFact[]
    unknown: StudyFact[]
}

let React = { createElement: createElement }

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
            let selectedFact = this.state.selectedFact

            if (selectedFact >= this.props.facts.length-1) {
                this.props.done(known, unknown)
            }
            else {
                this.setState({
                    selectedFact: selectedFact+1,
                    known: known,
                    unknown: unknown
                })

                this.props.factSelected(this.props.facts[selectedFact])
            }
        }

        let selectedFact = this.props.facts[this.state.selectedFact]

        let knew = () => {
            next(this.state.known.concat([ selectedFact ]), this.state.unknown)
        }

        let didntKnow = () => {
            next(this.state.known, this.state.unknown.concat([ selectedFact ]))
        }

        return <div>
            <div className='buttonBar'>
                <div className='button left smallText' onClick={ knew }>I knew<br/>that...</div>
                <div className='button right smallText' onClick={ didntKnow }>I didn't know<br/>that...</div>
            </div>
            <div className='lower'>
                <ul className='didYouKnowFact'>
                    <StudyFactComponent 
                        key={ selectedFact.fact.getId() }
                        hiddenFacts={ this.props.hiddenFacts }
                        fact={ selectedFact.fact } 
                        studyFact={ selectedFact } 
                        sentence={ this.props.sentence } 
                        corpus={ this.props.corpus }
                        knowledge={ this.props.knowledge } 
                        onKnew={ (fact: StudyFact) => {} }
                        known={ true }
                    />
                </ul>
            </div>
        </div>
    }

}