

import { EndingTransform } from '../../../shared/Transforms'

import { Component, createElement } from 'react'

interface Props {
    fact: EndingTransform
}

interface State {}

let React = { createElement: createElement }

export default class TransformFactEntryComponent extends Component<Props, State> {
    render() {
        let fact = this.props.fact
        
        return <div>
            <strong className='nobr'>
                { fact.from }
            </strong> is replaced with <strong className='nobr'>
                { fact.to }
            </strong> after <strong className='nobr'>
                { fact.after.split('').join(', ') }
            </strong>
        </div>
   }
}
