"use strict";

import Sentence from './Sentence';
import Sentences from './Sentences';
import Word from './Word';
import Words from './Words';
import Facts from './Facts';

function wordToString(word: Word, words: Words) {
    return word.getId().replace(/ /g, '_')   
}

export function sentenceToString(sentence: Sentence, words: Words) {
    let tags = []
    
    if (sentence.author) {
        tags.push('author: ' + sentence.author)
    }
 
    if (sentence.required) {        
        sentence.required.forEach((fact) => 
            tags.push('requires: ' + fact.getId()))
    }

    let en = sentence.en()
    
    if (!en || en == 'undefined' || en == 'null') {
        en = ''
    }

    return sentence.id + ' ' + sentence.words.map((word) => 
        wordToString(word, words)).join(' ') 
            + (tags.length ? ' (' + tags.join(', ') + ')' : '')  
            + ': ' + en
}

export default function sentencesToString(sentences: Sentences, words: Words) {
    let res = ''
    let lineNumber = 0
    
    sentences.sentences.forEach((sentence) => {
        while (lineNumber < sentence.getId()) {
            lineNumber++
            res += '\n'
        }

        res += sentenceToString(sentence, words) + '\n'

        lineNumber++
    })
    
    return res
}