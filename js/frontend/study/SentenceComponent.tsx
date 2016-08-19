
import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Words from '../../shared/Words'

import StudyWord from './StudyWord'
import StudyFact from './StudyFact'
import Fact from '../../shared/fact/Fact'
import Sentence from '../../shared/Sentence'
import PhraseCase from '../../shared/phrase/PhraseCase'
import Phrase from '../../shared/phrase/Phrase'

const MAX_FONT_SIZE = 64;

class WordGroup {
    constructor(public words: StudyWord[], public startIndex: number) {
        this.words = words
        this.startIndex = startIndex
    }
}

interface Props {
    facts: Fact[],
    corpus: Corpus,
    words: StudyWord[],
    reveal: boolean,
    highlight: StudyFact,
    wordClicked: (StudyWord) => any
}

interface State {
    groupedWords?: WordGroup[]
}

let React = { createElement: createElement }

export default class SentenceComponent extends Component<Props, State> {
    resizeListener = () => this.resize()
    lastFillRatio: number

    constructor(props) {
        super(props)

        this.state = this.getStateForProps(props)
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.getStateForProps(nextProps))
    }

    isStudiedFact(fact: Fact) {
        return !!this.props.facts.find(f => f.getId() == fact.getId())
    }

    isWordStudied(word: StudyWord): boolean {
        return !!word.facts.find((f) => this.isStudiedFact(f.fact))
    }

    getStateForProps(props: Props): State {
        let corpus = props.corpus

        let groupedWords: WordGroup[] = []

        let lastWasHidden 

        this.props.words.forEach((word, index) => {
            let thisHidden = this.isWordStudied(word)
            
            if (groupedWords.length && ((thisHidden && lastWasHidden) || (!thisHidden && !lastWasHidden))) {
                groupedWords[groupedWords.length-1].words.push(word)
            }
            else {
                groupedWords.push(new WordGroup([word], index))
            }

            lastWasHidden = this.isWordStudied(word)
        })

        return {
            groupedWords: groupedWords
        }
    }

    render() {
        let reveal = this.props.reveal
        let capitalize = true

        let spacedMap = (list: StudyWord[], callback: (item: StudyWord, index: number) => any) => {
            let result = []

            list.forEach((item, index) => {
                if (index > 0) {
                    if (item.jp == '—') {
                        result.push(<br key={'newline' + index }/>)
                        result.push(callback(item, index))
                    }
                    else if (isWordWithSpaceBefore(item)) {
                        if (this.isWordStudied(item) && this.isWordStudied(list[index-1])) {
                            result.push(<span key={'space' + index } className='space studied'>&nbsp;</span>)
                        }
                        else {
                            result.push(' ')
                        }

                        result.push(callback(item, index))
                    }
                    else {
                        result[result.length-1] = <span className='nobr' key={'nobr' + index } >
                            { result[result.length-1] }
                            { callback(item, index) }
                        </span>
                    }
                }
                else {
                    result.push(callback(item, index))
                }
            })

            return result
        }

        let className = 'content'

        if (reveal) {
            className += ' revealed' 
        }
        else {
            className += ' hidden'
        }


        let highHighlight
        let lowHighlight 

        if (this.props.highlight) {
            let highlightFact = this.props.highlight.fact

            highHighlight = (word: StudyWord) => word.hasFact(highlightFact)

            if (highHighlight && highlightFact instanceof PhraseCase) {
                lowHighlight = (word: StudyWord) => word.isPartOfPhrase(highlightFact.phrase)
            }
            else if (highHighlight && highlightFact instanceof Phrase) {
                lowHighlight = (word: StudyWord) => word.isPartOfPhrase(highlightFact)
            }
        }

        return <div className='sentence' ref='container'><div className={ className } ref='content'>
            {
                spacedMap(this.props.words, (word, index) => {
                    let className = 'word'
                    let text = word.jp

                    if (capitalize && text) {
                        text = text[0].toUpperCase() + text.substr(1)
                    }

                    let formHint

                    if (this.isWordStudied(word)) {
                        if (!reveal) {
                            text = word.getHint()
                            formHint = word.getFormHint()
                        }

                        className += ' studied'
                    }

                    if (highHighlight && highHighlight(word)) {
                        className += ' highlight high'
                    }
                    else if (lowHighlight && lowHighlight(word)) {
                        className += ' highlight low'
                    }

                    capitalize = word.jp && Words.SENTENCE_ENDINGS.indexOf(word.jp) >= 0

                    return <div key={ index } className={ className } onClick={ () => this.props.wordClicked(word) }>
                            { text || <span>&nbsp;</span>}
                        { (formHint ?
                            <span className='form'>{ formHint }</span>
                            :
                            []                                
                        ) }
                    </div>
                })
            }
            </div></div>
    }

    componentDidMount() {
        window.addEventListener('resize', this.resizeListener)

        this.resize()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeListener)
    }

    componentDidUpdate() {
        this.resize()
    }

    resize() {
        let container = (this.refs['container'] as HTMLElement)
        let content = (this.refs['content'] as HTMLElement)

        function getWidth(element: HTMLElement) {
            return parseInt(window.getComputedStyle(element, null).getPropertyValue('width').replace('px', ''))
        }

        function getHeight(element: HTMLElement) {
            return parseInt(window.getComputedStyle(element, null).getPropertyValue('height').replace('px', ''))
        }

        let fillRatio = () => {
            let widthRatio = getWidth(content) / getWidth(container)
            let heightRatio = getHeight(content) / getHeight(container)

            let result

            if (widthRatio > 1 && widthRatio > heightRatio) {
                result = widthRatio * widthRatio
            }
            else {
                result = widthRatio * heightRatio 
            }

            this.lastFillRatio = result

            return result  
        }

        let trySize = (lo: number, mid: number, hi: number) => {
            if (hi - lo < 4) {
                return
            }

            container.setAttribute('style', 'font-size: ' + mid + 'px')

            let fill = fillRatio()

            let newMid = mid / Math.sqrt(fill) 

            if (fill > 1) {
                trySize(lo, Math.min(newMid, mid * 0.9), mid)
            }
            else if (fill > 0.9) {
                return
            }
            else {
                if (hi / newMid < 1.1) {
                    return
                }

                trySize(mid, newMid, hi)
            }
        }

        let last = this.lastFillRatio
        let fill = fillRatio()

        if (Math.abs(fill - last) < 0.05 && fill <= 1) {
            return
        }

        let currentSize = parseInt(window.getComputedStyle(container, null).getPropertyValue("font-size").replace('px',''))

        let guesstimate = Math.min(currentSize / Math.sqrt(fillRatio()), MAX_FONT_SIZE)

        trySize(0, guesstimate, Math.min(getWidth(container), MAX_FONT_SIZE))

        console.log('done')
    }
}

function isWordWithSpaceBefore(word: StudyWord) {
    return !(word.jp.length == 1 && Words.PUNCTUATION_NOT_PRECEDED_BY_SPACE.indexOf(word.jp) >= 0)
}

