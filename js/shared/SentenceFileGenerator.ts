"use strict";

import Sentence from './Sentence';
import Sentences from './Sentences';
import Word from './Word';
import Words from './Words';
import Facts from './Facts';

function wordToString(word: Word, words: Words) {
    let simpleId = word.jp + (word.classifier ? '[' + word.classifier + ']' : '')

    if (words.get(simpleId)) {
        return simpleId
    }
    else {
        return word.getId()   
    }
}

export function sentenceToString(sentence: Sentence, words: Words) {
    return sentence.words.map((word) => 
        wordToString(word, words)).join(' ') + ': ' + sentence.en()
}

export default function sentencesToString(sentences: Sentences, words: Words) {
    return sentences.sentences.map((sentence) => {
        return sentenceToString(sentence, words) + '\n'
    }).join('')
}