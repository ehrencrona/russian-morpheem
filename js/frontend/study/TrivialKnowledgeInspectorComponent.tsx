

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import StudyFactComponent from './StudyFactComponent'
import Fact from '../../shared/fact/Fact'

import TrivialKnowledge from '../../shared/study/TrivialKnowledge'

interface Props {
    knowledge: TrivialKnowledge
}

interface State {
}

let React = { createElement: createElement }

export default class TrivialKnowledgeInspectorComponent extends Component<Props, State> {
    constructor(props) {
        super(props)
    }


    render() {
        let known = this.props.knowledge.known

        return <div className='knowledgeInspector'>
                <div>What you know: { 
                    this.props.knowledge.getAllTrivialFacts().join(', ')
                }</div>
            </div>
    }

}