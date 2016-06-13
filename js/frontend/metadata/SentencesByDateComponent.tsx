/// <reference path="../../../typings/react/react.d.ts" />
/// <reference path="../../../typings/chart-js.d.ts" />

import { Component, createElement } from 'react'
import { SentencesByDate, SentencesByAuthor } from '../../shared/metadata/SentencesByDate'
import Corpus from '../../shared/Corpus'
import { Chart } from 'chart.js';

interface Props {
    corpus: Corpus
}

interface State {
    sentencesByDate: SentencesByDate
}

let React = { createElement: createElement }

export default class PendingSentencesComponent extends Component<Props, State> {
    chart: Chart

    renderGraph(canvas: HTMLCanvasElement) {
        if (this.chart) {
            this.chart.destroy();
        }

        let chartData = {
            type: 'line',
            data: {
                labels: this.state.sentencesByDate.days,
                datasets: 
                    this.state.sentencesByDate.authors.map((author) =>
                    {
                        return { 
                            data: this.state.sentencesByDate.values.map(
                                (value: SentencesByAuthor) => {
                                    return value[author]
                                }
                            ),
                            label: author 
                        }
                    })
            }
        }

console.log(chartData)

        this.chart = new Chart(canvas.getContext('2d'), chartData);        
    }

    componentDidMount() {
        this.props.corpus.sentenceHistory.getSentencesByDate().then(
            (sentencesByDate) => this.setState({ sentencesByDate: sentencesByDate }))
            .catch((e) => console.error(e.stack))
    }

    render() {
        if (!this.state || !this.state.sentencesByDate) {
            return <div/>
        }

        return <canvas ref={ (canvas) => this.renderGraph(canvas) }></canvas>
    }
}