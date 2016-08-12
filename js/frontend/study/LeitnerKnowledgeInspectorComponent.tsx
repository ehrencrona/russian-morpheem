

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import Fact from '../../shared/fact/Fact'

import LeitnerKnowledge from '../../shared/study/LeitnerKnowledge'

interface Props {
    knowledge: LeitnerKnowledge,
    currentFact?: Fact
}

interface State {
}

let React = { createElement: createElement }

export default class LeitnerKnowledgeInspectorComponent extends Component<Props, State> {
    constructor(props) {
        super(props)
    }


    render() {
        let known = this.props.knowledge.known

        return <div className='knowledgeInspector'>
                <div className='decks'>{
                    this.props.knowledge.decks.map((deck, index) => {

                        return <div className='deck' key={index}>
                            <h3>Deck #{ index + 1 }</h3>
                            <ul>
                            {
                                deck.facts.map((fact) => 

                                    <li key={ fact.getId() } className={ this.props.currentFact && fact.getId() == this.props.currentFact.getId() ? 'current' : '' }>
                                        { fact.getId() }
                                    </li>

                                )

                            }
                            </ul>
                        </div>

                    })
                }</div>
            </div>
    }

}