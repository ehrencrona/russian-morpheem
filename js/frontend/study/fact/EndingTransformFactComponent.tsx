

import { Component, createElement } from 'react'
import { EndingTransform } from '../../../shared/Transforms'

import { FactComponentProps } from './StudyFactComponent'

let React = { createElement: createElement }

let wordFactComponent = (props: FactComponentProps<EndingTransform>) => {
    return <div>
        <strong className='nobr'>
            { props.fact.from }
        </strong> is replaced with <strong className='nobr'>
            { props.fact.to }
        </strong> after <strong className='nobr'>
            { props.fact.after.split('').join(', ') }
        </strong>
    </div>
}

export default wordFactComponent;
