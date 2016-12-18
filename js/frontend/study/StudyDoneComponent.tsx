import Progress from '../../shared/study/Progress';
import { Z_UNKNOWN } from 'zlib';
import Exposures from '../../shared/study/Exposures';
import { Knowledge } from '../../shared/study/Exposure';

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Words from '../../shared/Words'

import StudentProfile from '../../shared/study/StudentProfile'
import FixedIntervalFactSelector from '../../shared/study/FixedIntervalFactSelector'
import ProgressGraph from './ProgressGraphComponent'

interface Props {
    profile: StudentProfile
    factSelector: FixedIntervalFactSelector
    corpus: Corpus,
    exposures: Exposures
    onRestart: () => any
}

interface State {
    stored: boolean
}

let React = { createElement: createElement }

export default class StudyDone extends Component<Props, State> {

    componentWillMount() {
        let factSelector = this.props.factSelector
        let knowledge = this.props.profile.knowledge

        let now = new Date()
        now = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        let progress: Progress = {
            date: now,
            known: [],
            unknown: [],
            studying: []
        }

        this.props.corpus.facts.facts.forEach(fact => {

            if (factSelector.isEverStudied(fact)) {
                progress.studying.push(fact.getId())
            }
            else {
                let factKnowledge = knowledge.getKnowledge(fact)

                if (factKnowledge == Knowledge.KNEW) {
                    progress.known.push(fact.getId())
                }
                else if (factKnowledge == Knowledge.DIDNT_KNOW) {
                    progress.unknown.push(fact.getId())
                }
            }

        })

        this.props.exposures.storeProgress(progress, -1)
        .then(() => {
            this.setState({ stored: true})
        })
    }

    render() {
        return <div>
            <div className='graphContainer'>
                <div className='graph'>
                {
                    this.state && this.state.stored
                    ? <ProgressGraph corpus={ this.props.corpus } exposures={ this.props.exposures }/>
                    : null
                }
                </div>

                <ul className='legend'>
                    <li><div className='swatch studying'>&nbsp;</div>studying</li>
                    <li>In long-term memory:</li>
                    <li><div className='swatch phrases'>&nbsp;</div>phrases</li>
                    <li><div className='swatch words'>&nbsp;</div>words</li>
                    <li><div className='swatch forms'>&nbsp;</div>endings</li>
                </ul>
            </div>

            <div className='progressContainer'>
                <div className='progress'>
                    <h2>Session completed</h2>

                    <div className='explanation'>
                        You have gone through all the facts you planned on learning today.
                        You know all of them well enough that repeating them again right now will not help.
                    </div>
                    <div className='explanation'>
                        You can either pick new facts to learn, 
                        come back later today to rehearse what you learned, 
                        or come back tomorrow for a new session.
                    </div>
                </div>
            </div>

            <div className='button' onClick={ this.props.onRestart }>
                Pick new facts to learn
            </div>
        </div>
    }

}