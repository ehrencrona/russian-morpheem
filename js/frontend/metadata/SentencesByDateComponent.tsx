/// <reference path="../../../typings/react/react.d.ts" />
/// <reference path="../../../typings/chart-js.d.ts" />
/// <reference path="../../../typings/human-time.d.ts" />

import { Component, createElement } from 'react'
import { SentencesByDate, SentencesByAuthor } from '../../shared/metadata/SentencesByDate'
import Corpus from '../../shared/Corpus'
import { Chart } from 'chart.js';
import human = require('human-time')

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
        if (!canvas) {
            console.warn('no canvas?')

            return
        }

        if (this.chart) {
            this.chart.destroy();
        }

        let chartData = {
            type: 'line',
            data: {
                labels: this.state.sentencesByDate.days.map((day) => {
                    let date = new Date(day * 24 * 60 * 60 * 1000)

                    return human(date)
                }),
                datasets: 
                    this.state.sentencesByDate.authors.map((author) =>
                    {
                        let total = 0

                        return {
                            data: this.state.sentencesByDate.values.map(
                                (value: SentencesByAuthor) => {
                                    if (value[author] > 0) {
                                        total += value[author]
                                    }

                                    return total
                                }
                            ),
                            label: author 
                        }
                    })
            }
        }

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