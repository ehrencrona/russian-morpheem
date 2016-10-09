

import Phrase from '../../../shared/phrase/Phrase'
import Match from '../../../shared/phrase/Match'
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import Corpus from '../../../shared/Corpus'
import Sentence from '../../../shared/Sentence'
import { Knowledge } from '../../../shared/study/Exposure'

import { Component, createElement } from 'react'

interface Props {
    fact: Phrase
    corpus: Corpus
    knowledge: NaiveKnowledge
}

interface State {
    matches: Match[]
}

let React = { createElement: createElement }
const SENTENCES_WANTED = 2

export default class PhraseFactEntryComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            matches: this.findMatches(props)
        }
    }

    findMatches(props) {
        let simpleMatches: Match[] = []
        let hardMatches: Match[] = []

        let start = new Date()
        let phrase = props.fact

        props.corpus.sentences.sentences.find(sentence => {
            if (!phrase.isAutomaticallyAssigned() &&
                !sentence.phrases.find((p) => p.getId() == phrase.getId())) {
                return
            }

            let match = phrase.match({
                words: sentence.words,
                sentence: sentence,
                facts: props.corpus.facts
            })
            
            if (match) {
                let simple = !match.words.find(word => 
                    props.knowledge.getKnowledge(word.word.getWordFact()) != Knowledge.KNEW);

                (simple? simpleMatches : hardMatches).push(match)

                if (simpleMatches.length >= SENTENCES_WANTED) {
                    return true
                }
            }

        })

        return simpleMatches.concat(hardMatches).slice(0, SENTENCES_WANTED)
    }

    render() {

        return <div>
            { 
                this.state.matches.map(match =>
                    <div>{
                        match.words.map(w => w.word.toText()).join(' ') + ' – ' +
                        match.pattern.getEnglishFragments().map(f => f.en(match, (word) => word.getEnglish())).join(' ')
                    }</div>
                )
            }
        </div>
    }
}
