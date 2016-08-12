import Sentence from '../../shared/Sentence'
import Tab from '../OpenTab'
import SentenceComponent from '../SentenceComponent'
import Corpus from '../../shared/Corpus'



import { Component, createElement } from 'react';
let React = { createElement: createElement }

export default function openSentence(sentence: Sentence, corpus: Corpus, tab: Tab) {
    tab.openTab(
        <SentenceComponent sentence={ sentence } corpus={ corpus } tab={ tab }/>,
        sentence.toString(),
        sentence.getId().toString()
    )
}
