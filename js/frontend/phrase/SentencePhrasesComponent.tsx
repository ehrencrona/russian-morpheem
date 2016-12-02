import { DebugPosition } from '../../shared/phrase/MatchContext';
import { DebugNode } from './PhraseDebugger';
import PhraseDebugger from './PhraseDebugger';


import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import Phrase from '../../shared/phrase/Phrase'
import Translatable from '../../shared/Translatable'
import PhraseCase from '../../shared/phrase/PhraseCase'
import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'
import PhraseFactComponent from './PhraseFactComponent'
import Tab from '../OpenTab'
import StudyPhrase from '../../shared/study/StudyPhrase'
import StudyWord from '../../shared/study/StudyWord'
import StudyToken from '../../shared/study/StudyToken'
import toStudyWords from '../../shared/study/toStudyWords'

interface Props {
    corpus: Corpus
    sentence: Sentence
    tab: Tab
}

interface State {
    debug?: boolean
    openDebugNodes?: Set<number>
}

let React = { createElement: createElement }

export default class SentencePhrasesComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            openDebugNodes: new Set<number>()
        }
    }

    openPhrase(phrase) {
        this.props.tab.openTab(
            <PhraseFactComponent fact={ phrase } corpus={ this.props.corpus } tab={ this.props.tab }/>,
            phrase.toString(),
            phrase.id.toString()
        )
    }

    addPhrase(phrase) {
        this.props.corpus.sentences.addPhrase(phrase, this.props.sentence)
        this.forceUpdate()
    }

    removePhrase(phrase) {
        this.props.corpus.sentences.removePhrase(phrase, this.props.sentence)
        this.forceUpdate()
    }

    renderSentenceExtract(phrase: Phrase) {
        let words = this.props.sentence.words

        let match = phrase.match({ sentence: this.props.sentence, words: words, facts: this.props.corpus.facts })

        if (!match) {
            return <div classname='error'>Does not fit pattern</div>
        }
        else {
            return <div className='match'>{
                match.words.map((wordIndex) => words[wordIndex.index].jp).join(' ')
            }</div>
        }
    }

    getBreakdown(studyTokens: StudyToken[]) {
        function getPhraseCase(word: StudyWord): PhraseCase {
            let fact = word.facts.find((f) => f.fact instanceof PhraseCase)

            if (!fact) {
                return
            }

            return fact.fact as PhraseCase
        }

        let result = []

        studyTokens.forEach((w) => {
            if (w instanceof StudyPhrase) {
                result.push(w.getHint() || '___')
            }
            else {
                result.push(`??? (${ w.jp })`) 
            }
        })

        return result.join(' ')
    }

    renderStudyWords(phrase: Phrase, debug?: (message: string, position: DebugPosition) => void) {
        let match = phrase.match({ sentence: this.props.sentence, words: this.props.sentence.words, 
            facts: this.props.corpus.facts, debug: debug })

        if (!match) {
            return <div>
                <div className='match error'>Unmatched</div>
                <div className='phrase'>{ 
                    phrase.description 
                }</div>
            </div>
        }

        let studyTokens =
            toStudyWords(this.props.sentence, [ phrase ], this.props.corpus, true)
                .filter((w) => w instanceof StudyPhrase || !!w.facts.find((f) => f.fact instanceof PhraseCase))

        return <div>
            <div className='match'>{ 
                match.words.map((w) => w.word.jp).join(' ')
            } – {
                this.getBreakdown(studyTokens)
            }</div>
            <div className='phrase'>{ 
                phrase.description 
            }</div>
        </div>
    }

    render() {
        let corpus = this.props.corpus
        let sentence = this.props.sentence

        let phraseDebugger
        let debug 
        
        if (this.state.debug) {
            phraseDebugger = new PhraseDebugger()
            debug = phraseDebugger.debug()
        }

        let potentialPhrases = corpus.phrases.all().filter((p) =>
            !p.isAutomaticallyAssigned() &&
            !!p.match({ sentence: sentence, words: sentence.words, facts: corpus.facts, 
                debug: null }) && 
            !sentence.hasPhrase(p)
        )

        let renderPhrase = (p, debug?) => 
            <div className='clickable' onClick={() => this.openPhrase(p) }>
                { this.renderStudyWords(p, debug) }</div>

        return <div>
            <div className='sentencePhrases'>
                <div className='current'>
                    <h4>Added</h4>
                    <ul>{

                        this.props.sentence.phrases.map((p) => 
                            <li key={ p.id }>
                                <div className='clickable button' onClick={ () => this.removePhrase(p) }>Remove</div>
                                { renderPhrase(p, debug) }
                            </li>
                        )

                    }</ul>
                </div>

                <div className='matching'>
                    <h4>Matching</h4>

                    <ul>{
                        potentialPhrases.map((p) => 
                            <li key={ p.id }>
                                <div className='clickable button' onClick={ () => this.addPhrase(p) } >Add</div>
                                { renderPhrase(p) }
                            </li>
                        )
                    }</ul>
                </div>
            </div>
            {
                this.renderPhraseDebugger(phraseDebugger)
            }
        </div>

    }

    renderPhraseDebugger(phraseDebugger: PhraseDebugger) {
        return <div className='phraseDebugger'>
            { 
                phraseDebugger ?
                    <div className='debug'>
                        { this.renderDebugNode(phraseDebugger.root) }
                    </div>
                    :
                    <div className='button' onClick={ () => this.setState({ debug: true }) }>
                        Debug
                    </div>
            }
            </div>
    }

    renderDebugNode(node: DebugNode) {
        let openDebugNodes = this.state.openDebugNodes
        let open = openDebugNodes.has(node.id) || !node.parent 

        return <ul key={ node.id } >
            { 
                node.children.length ?
                    <div className='toggle'>{
                        open?
                        <a onClick={ () => { openDebugNodes.delete(node.id); this.setState({ openDebugNodes: openDebugNodes }) }}>-</a> :
                        <a onClick={ () => { openDebugNodes.add(node.id); this.setState({ openDebugNodes: openDebugNodes }) }}>+</a> 
                    }</div>
                    : 
                    null
            }
            <div>{
                node.startMessage
            }</div>
            { 
                open ?
                node.children.map(n => {
                    return this.renderDebugNode(n)
                }) :
                null
            }
            <div>{
                node.endMessage
            }</div>
        </ul>
    }

}