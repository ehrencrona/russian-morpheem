/// <reference path="../../typings/react/react.d.ts" />

import {Component,createElement} from 'react';
import Corpus from '../shared/Corpus';

interface Props {
    corpus: Corpus
}

interface State {}

let React = { createElement: createElement }

export default class TestComponent extends Component<Props, State> {
    render() {
        return (<div>
            {
                this.props.corpus.facts.facts.map((fact) => {
                    return <div>{ fact.getId() }</div>
                })
            }
            </div>)
    }
}
