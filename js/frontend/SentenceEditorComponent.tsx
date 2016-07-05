/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus';
import Fact from '../shared/fact/Fact';
import Word from '../shared/Word';
import InflectedWord from '../shared/InflectedWord';
import UnparsedWord from '../shared/UnparsedWord';
import Sentence from '../shared/Sentence';

import { Component, cloneElement, createElement } from 'react';

interface Props {
    corpus: Corpus,
    words: Word[],
    onWordSelect: (Word) => any,
    onSentenceChange: (words: Word[]) => any
}

interface EmptyState {
}

interface EditorState {
    words?: Word[],
    selectedIndex?: number,
    insertMode?: boolean
}

let React = { createElement: createElement }

interface ElementProps {
    selected?: boolean,
    onClick?: () => any, 
    onDragStart?: (e) => any
    onDrop?: (e) => any
}

interface WordProps extends ElementProps {
    word: Word,
    corpus: Corpus
}

interface WordState {
    dragTarget: boolean
}

class WordComponent extends Component<WordProps, WordState> {
    constructor(props) {
        super(props)
        
        this.state = {
            dragTarget: false
        }
    }
    
    render() {
        let word = this.props.word
        let words = this.props.corpus.words

        let formTag = <div/>
        
        let disambiguation = word.getDisambiguation(words)

        if (disambiguation) {
            formTag = <div className='form'>{ disambiguation }</div>
        }

        return <div draggable='true' className={'word' + 
            (word instanceof UnparsedWord ? ' unparsed' : '') + 
            (this.props.selected ? ' selected' : '') + 
            (this.state.dragTarget ? ' drag-target' : '')} 
                onClick={ this.props.onClick }
                onDragOver={ (e) => {
                    this.setState({ dragTarget: true })
                    e.preventDefault()
                } }
                onDragLeave={ (e) => {
                    this.setState({ dragTarget: false })
                } }
                onDrop={ (e) => {
                    this.setState({ dragTarget: false })
                    this.props.onDrop(e) 
                } } 
                onDragStart={ this.props.onDragStart }>
            <div>{ (word instanceof UnparsedWord ? '"' + word.jp + '"' : word.jp) }</div>
            { formTag }
        </div>; 
    }

}

interface SpaceProps extends ElementProps {
    onDrop?: (e) => any
}

class SpaceComponent extends Component<ElementProps, EmptyState> {
    render() {
        return <div 
            className='space'
            onDrop={ this.props.onDrop } 
            />
    }
}

class SentenceEndComponent extends Component<ElementProps, EmptyState> {
    render() {
        return <div className='sentenceEnd'
            onDragOver={ (e) => e.preventDefault() }
            onDrop={ this.props.onDrop } 
            onClick={ this.props.onClick }
        />
    }
}

class TrashComponent extends Component<ElementProps, EmptyState> {
    render() {
        return <div className='trash button'
            onDragOver={ (e) => e.preventDefault() }
            onDrop={ this.props.onDrop } 
            onClick={ this.props.onClick }
        >Trash</div>
    }
}

export default class SentenceEditorComponent extends Component<Props, EditorState> {
    constructor(props: Props) {
        super(props)
                
        this.state = {
            words: props.words,
            selectedIndex: props.words.length,
            insertMode: true
        }
    }

    setWord(word: Word, index?, insert?) {
        if (!word) {
            throw new Error('No word.')
        }
        
        if (index === undefined) {
            insert = this.state.insertMode
            index = this.state.selectedIndex
        }

        this.state.words.splice(index, (insert ? 0 : 1), word)
        
        this.setState({ 
            words: this.state.words,
            selectedIndex: index+1,
            insertMode: true
        })

        this.sentenceChanged(this.state.words)
    }

    dragAndDrop(fromIndex, toIndex) {
        let word = this.state.words[fromIndex]

        this.state.words.splice(toIndex, 0, word)
        
        if (fromIndex >= toIndex) {
            fromIndex++
        }
        
        this.state.words.splice(fromIndex, 1)

        this.setState({ 
            words: this.state.words,
            selectedIndex: toIndex + 1
        })
        
        this.sentenceChanged(this.state.words)
    }
    
    deleteWord(index) {
        this.state.words.splice(index, 1)

        this.setState({
            words: this.state.words,
            selectedIndex: this.state.selectedIndex + 
                ( this.state.selectedIndex > index ? -1 : 0)
        })

        this.sentenceChanged(this.state.words)
    }
    
    sentenceChanged(words: Word[]) {
        this.props.onSentenceChange(words)
    }
    
    render() {
        let drop = (index) => (e) => {
            let drag = JSON.parse(e.dataTransfer.getData('text'))
            
            if (drag.index != null) {
                if (drag.index == index) {
                    return
                }
            
                this.dragAndDrop(drag.index, index)
            }
            else {
                let fact = this.props.corpus.facts.get(drag.word)
                
                if (fact instanceof Word) {
                    this.setWord(fact, index, true)                                
                }
                else {
                    console.error(`Couldn't find fact "${ drag.word }"`)
                }
            }
        }

        return <div className='sentenceEditor'>{ 
            this.props.words.map((word, index) => {
                let elements = []
                
                if (index == this.state.selectedIndex && this.state.insertMode) {
                    elements.push(<SpaceComponent onDrop={ drop(index) }/>)
                }
                
                let onClick = () => {
                    let insertMode = false
                    
                    if (this.state.selectedIndex == index) {
                        insertMode = !this.state.insertMode                                
                    }

                    this.setState({ selectedIndex: index, insertMode: insertMode })
                    
                    if (!insertMode) {
                        this.props.onWordSelect(word)
                    }
                }
                
                elements.push(
                    <WordComponent 
                        key={ index } 
                        word={ word }
                        corpus={ this.props.corpus }
                        selected={ index == this.state.selectedIndex && !this.state.insertMode }
                        onClick={ onClick }
                        onDragStart={ (e) => { 
                            e.dataTransfer.setData('text', JSON.stringify( { word: word.getId(), index: index } ));
                        } }
                        onDrop={
                            (e) => {
                                let drag = JSON.parse(e.dataTransfer.getData('text'))

                                if (index == drag.index) {
                                    onClick()
                                }
                                else {
                                    drop(index)(e) 
                                }                                  
                            } 
                        }
                    />)
                
                return elements
            })
        }
        {
            (this.state.selectedIndex == this.state.words.length && this.state.insertMode ?
                <SpaceComponent
                    onDrop={ drop(this.state.words.length) }/>
                :
                []
            )
        }

        <SentenceEndComponent
            onClick={ () => {
                this.setState({ selectedIndex: this.state.words.length, insertMode: true })
            } }
            onDrop={ drop(this.state.words.length) }
        />

        <TrashComponent
            onDrop={ (e) => {                
                let drag = JSON.parse(e.dataTransfer.getData('text'))
                
                if (drag.index != undefined) {
                    this.deleteWord(drag.index)
                }
            } }
            
            onClick={
                () => {
                    if (this.state.selectedIndex >= 0) {
                        this.deleteWord(this.state.selectedIndex)
                    }
                }
            }
        />
        
        </div>
    }
}
