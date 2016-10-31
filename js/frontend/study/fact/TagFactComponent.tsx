

import { Component, createElement } from 'react'
import TagFact from '../../../shared/TagFact'

import { FactComponentProps } from './StudyFactComponent'

let React = { createElement: createElement }

let tagComponent = (props: FactComponentProps<TagFact>) => {

    let words = props.studyFact.words.map(w => w.jp).join(', ')

    return <div>
        <strong className='nobr'>
            { words }
        </strong> are part of the topic <strong className='nobr'>
            { props.corpus.factoids.getFactoid(props.fact).name }
        </strong>
    </div>
}

export default tagComponent;
