

import { Component, createElement } from 'react'
import { InflectionForm } from '../../../shared/inflection/InflectionForms'

import { FactComponentProps } from './StudyFactComponent'

let React = { createElement: createElement }

let formComponent = (props: FactComponentProps<InflectionForm>) => {

    let words = props.studyFact.words.map(w => w.jp).join(', ')

    return <div>
        <strong className='nobr'>
            { words }
        </strong> uses the form <strong className='nobr'>
            { props.fact.name }
        </strong>
    </div>
}

export default formComponent;
