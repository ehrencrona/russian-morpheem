import Fact from '../../shared/fact/Fact'
import Tab from '../OpenTab'
import FactComponent from './FactComponent'
import Corpus from '../../shared/Corpus'



import { Component, createElement } from 'react';
let React = { createElement: createElement }

export default function openFact(fact: Fact, corpus: Corpus, tab: Tab) {
    tab.openTab(
        <FactComponent fact={ fact } corpus={ corpus } tab={ tab }/>,
        fact.toString(),
        fact.getId().toString()
    )
}
