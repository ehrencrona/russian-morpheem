
import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Words from '../../shared/Words'

import StudyWord from './StudyWord'
import StudyFact from './StudyFact'
import StudyToken from './StudyToken'
import StudyPhrase from './StudyPhrase'

import Fact from '../../shared/fact/Fact'
import Sentence from '../../shared/Sentence'
import PhraseCase from '../../shared/phrase/PhraseCase'
import Phrase from '../../shared/phrase/Phrase'

import animate from './animate'

interface Props {
    facts: Fact[],
    corpus: Corpus,
    tokens: StudyToken[],
    reveal: boolean,
    highlight: StudyFact,
    wordClicked: (StudyWord) => any
}

interface State {
}

let React = { createElement: createElement }

export default class SentenceComponent extends Component<Props, State> {
    resizeListener = () => this.resize()
    lastFillRatio: number

    constructor(props) {
        super(props)
    }

    componentWillReceiveProps(nextProps) {
    }

    animateOut(callback: () => any) {
        animate(this.refs['container'] as HTMLElement, 'leave', 200, callback)
    }

    animateIn(callback: () => any) {
        animate(this.refs['container'] as HTMLElement, 'enter', 200, callback)
    }

    isStudiedFact(fact: Fact) {
        return !!this.props.facts.find(f => f.getId() == fact.getId())
    }

    isWordStudied(word: StudyWord): boolean {
        return !!word.facts.find((f) => this.isStudiedFact(f.fact))
    }

    render() {
        let reveal = this.props.reveal

        let spacedMap = (list: StudyToken[], callback: (item: StudyToken, index: number) => any) => {
            let lines = [];
            let line = []

            list.forEach((item, index) => {
                if (index > 0) {
                    if (item.jp == '—') {
                        lines.push(<div className='line'>{ line }</div>)
                        line = []

                        line.push(callback(item, index))
                    }
                    else if (isWordWithSpaceBefore(item)) {
                        line.push(' ')

                        line.push(callback(item, index))
                    }
                    else {
                        line[line.length-1] = <span className='nobr' key={'nobr' + index } >
                            { line[line.length-1] }
                            { callback(item, index) }
                        </span>
                    }
                }
                else {
                    line.push(callback(item, index))
                }
            })

            if (line.length) {
                lines.push(<div className='line'>{ line }</div>)
            }

            return lines
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
                lowHighlight = (word: StudyWord) => word.hasFact((highlightFact as PhraseCase).phrase)
            }
            else if (highHighlight && highlightFact instanceof Phrase) {
                lowHighlight = (word: StudyWord) => word.hasFact(highlightFact)
            }
        }

        let tokens = this.props.tokens

        if (reveal) {
            tokens = flatten(tokens)
        }
        else {
            tokens = tokens.filter(t => 
                (t instanceof StudyWord ?
                    !t.word.omitted :
                    true))
        }

        let capitalize = (str) => str[0].toUpperCase() + str.substr(1) 
        let capitalizeNext = true

        return <div className='sentence' ref='container'><div className={ className } ref='content'>
            {
                spacedMap(tokens, (token, index) => {
                    
                    let className = 'word'
                    let text = token.jp

                    if (token instanceof StudyWord && token.word.omitted) {
                        className += ' omitted'
                    }

                    let formHint

                    if (token.studied) {
                        if (!reveal) {
                            text = token.getHint()
                        }

                        className += ' studied'
                    }

                    if (capitalizeNext && text) {
                        text = capitalize(text)
                    }

                    if (token instanceof StudyWord) {
                        if (highHighlight && highHighlight(token)) {
                            className += ' highlight high'
                        }
                        else if (lowHighlight && lowHighlight(token)) {
                            className += ' highlight low'
                        }
                    }

                    capitalizeNext = text && Words.SENTENCE_ENDINGS.indexOf(text) >= 0

                    return <div key={ index } className={ className } onClick={ () => token instanceof StudyWord && this.props.wordClicked(token) }>
                            { text || <span>&nbsp;</span>}
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
            else if (heightRatio > 1) {
                result = heightRatio * heightRatio
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

            if (isNaN(lo) || isNaN(mid) || isNaN(hi)) {
                console.error('invalid parameters for trySize', lo, mid, hi)

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
        
        let maxSize = parseInt(window.getComputedStyle(container.parentElement, null).getPropertyValue("font-size").replace('px',''))

        let guesstimate = Math.min(currentSize / Math.sqrt(fillRatio()), maxSize)

        trySize(0, guesstimate, Math.min(getWidth(container), currentSize))
    }
}

function flatten(tokens: StudyToken[]) {
    tokens = tokens.slice(0)

    for (let i = tokens.length; i >= 0; i--) {
        let token = tokens[i]

        if (token instanceof StudyPhrase) {
            tokens.splice(i, 1, ...token.words)
        }
    }  

    return tokens
}

function isWordWithSpaceBefore(word: StudyToken) {
    if (word instanceof StudyWord ) {
        return !(word.jp.length == 1 && Words.PUNCTUATION_NOT_PRECEDED_BY_SPACE.indexOf(word.jp) >= 0)
    }
    else {
        return true
    }
}

