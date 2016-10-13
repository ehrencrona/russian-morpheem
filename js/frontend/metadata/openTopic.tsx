
import Tab from '../OpenTab'

import Corpus from '../../shared/Corpus'
import { Topic } from '../../shared/metadata/Topics'
import TopicComponent from './TopicComponent'

import { Component, createElement } from 'react';

let React = { createElement: createElement }

export default function openTopic(topic: Topic, corpus: Corpus, tab: Tab) {
    tab.openTab(
        <TopicComponent topic={ topic } corpus={ corpus } tab={ tab }/>,
        topic.name,
        topic.id
    )
}
