

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import Tab from '../OpenTab'
import SentenceComponent from '../sentence/SentenceComponent'
import openSentence from '../sentence/openSentence'

import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {
    offset: number
}

const LS_KEY = 'allSentencesOffSet'
const PAGE_SIZE = 250
let React = { createElement: createElement }

export default class AllSentencesComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = { offset: parseInt(localStorage.getItem(LS_KEY)) || 0 }
    }

    neverEmpty(str: string) {
        if (!str.trim()) {
            return '<Empty sentence>'
        }
        else {
            return str
        }
    }

    render() {        
        let sentences = this.props.corpus.sentences.sentences

        let paging = <ul className='paging'>{

            Array.from(' '.repeat(Math.ceil(sentences.length / PAGE_SIZE))).map(
                (unused, pageIndex) => {
                    return <li key={ 'page' + pageIndex}
                        className={ (pageIndex * PAGE_SIZE == this.state.offset ? 'current' : '')} 
                        onClick={ () => {
                            let offset = pageIndex * PAGE_SIZE
                            this.setState({ offset: offset })
                            localStorage.setItem(LS_KEY, offset.toString())
                        } }>{ 
                    (pageIndex * PAGE_SIZE) + ' - ' + 
                        Math.min((pageIndex + 1) * PAGE_SIZE - 1, sentences.length)}</li>
                }
            )

            }</ul>


        return (<div className='allSentences'>
            { paging }

            <ul>

                { sentences
                    .slice(this.state.offset, this.state.offset + PAGE_SIZE)
                    .map((sentence) => 

                    <li key={ sentence.id }>
                        <div className='jp clickable' onClick={ () => openSentence(sentence, this.props.corpus, this.props.tab) } >{ 
                            this.neverEmpty(sentence.toString()) 
                        }</div>
                        <div className='en'>
                            { sentence.en() }
                        </div>

                    </li>

                ) }

            </ul>
            
        </div>)

    }

}