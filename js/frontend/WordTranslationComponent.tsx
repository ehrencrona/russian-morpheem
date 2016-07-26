
import Corpus from '../shared/Corpus'
import Translatable from '../shared/Translatable'
import InflectableWord from '../shared/InflectableWord'
import Word from '../shared/Word'
import { Component, createElement } from 'react';

let React = { createElement: createElement }

interface Props {
    word: Word|InflectableWord
    corpus: Corpus
}

export default function WordTranslationComponent(props: Props, children) {
    return <div className='wordTranslation'>
        <h3>Translation</h3>

        <input type='text' autoCapitalize='off' defaultValue={ props.word.getEnglish() } onBlur={ (e) => 
             props.corpus.words.setEnglish((e.target as HTMLInputElement).value, props.word) }/>
    </div> 
} 