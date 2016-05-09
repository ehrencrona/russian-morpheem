/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus';
import Fact from '../shared/Fact';
import Word from '../shared/Word';
import InflectedWord from '../shared/InflectedWord';
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
    word: Word
}

class WordComponent extends Component<WordProps, EmptyState> {
    
    render() {
        let form, word = this.props.word
        
        if (word instanceof InflectedWord) {
            form = <div className='form'>{ word.form }</div>     
        }
        else {
            form = []
        } 

        return <div draggable='true' className={'word' + ( this.props.selected ? ' selected' : '')} 
                onClick={ this.props.onClick }
                onDragOver={ (e) => e.preventDefault() }
                onDrop={ this.props.onDrop } 
                onDragStart={ this.props.onDragStart }>
            <div>{ this.props.word.toString() }</div>
            { form }
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

    setWord(word, index?, insert?) {
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
                this.setWord(this.props.corpus.words.get(drag.word), index, true)                                
            }
        }

        return <div className='sentenceEditor'>{ 
            this.props.words.map((word, index) => {
                let elements = []
                
                if (index == this.state.selectedIndex && this.state.insertMode) {
                    elements.push(<SpaceComponent onDrop={ drop(index) }/>)
                }
                
                elements.push(
                    <WordComponent 
                        key={ index } 
                        word={ word }
                        selected={ index == this.state.selectedIndex && !this.state.insertMode }
                        onClick={ () => {
                            let insertMode = false
                            
                            if (this.state.selectedIndex == index) {
                                insertMode = !this.state.insertMode                                
                            }

                            this.setState({ selectedIndex: index, insertMode: insertMode })
                            
                            if (!insertMode) {
                                this.props.onWordSelect(word)
                            }                            
                        } }
                        onDragStart={ (e) => { 
                            e.dataTransfer.setData('text', JSON.stringify( { word: word.getId(), index: index } ));
                        } }
                        onDrop={ drop(index) }
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
        />
        
        </div>
    }
}
