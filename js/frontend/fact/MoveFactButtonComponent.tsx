

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: Fact,
    onMove?: () => void
}

interface State {}

let React = { createElement: createElement }

export default class MoveFactButtonComponent extends Component<Props, State> {
    moveTo(toIndex: number) {
        if (toIndex < 1) {
            return
        }

        if (toIndex > this.props.corpus.facts.facts.length) {
            toIndex = this.props.corpus.facts.facts.length
        }

        let factIndex = this.props.corpus.facts.indexOf(this.props.fact) + 1;

        // move to puts it before the specified index, which is not what you expect.
        if (toIndex > factIndex) {
            toIndex++
        }

        this.props.corpus.facts.move(this.props.fact, toIndex-1);

        (this.refs['position'] as HTMLInputElement).value = 
            (this.props.corpus.facts.indexOf(this.props.fact) + 1).toString();

        this.forceUpdate()

        if (this.props.onMove) {
            this.props.onMove()
        }
    }

    render() {
        let factIndex = this.props.corpus.facts.indexOf(this.props.fact) + 1;

        return <div>
            <input type='number' className='position' ref='position' defaultValue={ factIndex.toString() }/>
            <div className='button' onClick={ () => { 
                this.moveTo(parseInt((this.refs['position'] as HTMLInputElement).value)) } }>Move</div>
        </div>;
    }
}
