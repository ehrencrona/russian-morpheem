/// <reference path="../../../typings/react/react.d.ts" />
/// <reference path="../../../typings/chart-js.d.ts" />
/// <reference path="../../../typings/human-time.d.ts" />

import { Component, createElement } from 'react'
import { SentencesByDate, SentencesByAuthor } from '../../shared/metadata/SentencesByDate'
import Corpus from '../../shared/Corpus'
import { Chart } from 'chart.js';
import human = require('human-time')

const COLORS = [
    '31c8c7',
    'f0af33',
    '766db0',
    '2CAAA9',
    'ff5f3b',
    'ffd02a',
    'd03a3e',
    '303030',
    '4bb6ac',
    'f8f7f5',
    'e95f3d'
]

interface Props {
    corpus: Corpus
}

interface State {
    sentencesByDate: SentencesByDate
}

let React = { createElement: createElement }

function toTransparentRgb(hexColor) {
    let r = parseInt(hexColor.substr(0,2), 16)
    let g = parseInt(hexColor.substr(2,2), 16)
    let b = parseInt(hexColor.substr(4,2), 16)

    return `rgba(${r},${g},${b},0.1)`
}

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

        let lastDay = new Date().getTime() - 24 * 60 * 60 * 1000

        let chartData = {
            type: 'line',
            data: {
                labels: this.state.sentencesByDate.days.map((day) => {
                    let date = new Date(day * 24 * 60 * 60 * 1000)

                    let result = human(date)

                    if (date.getTime() > lastDay) {
                        result = 'today'
                    }

                    return result
                }),
                datasets: 
                    this.state.sentencesByDate.authors.map((author, index) =>
                    {
                        let total = 0

                        return {
                            borderColor: COLORS[index % COLORS.length],
                            borderWidth: 2,
                            backgroundColor: toTransparentRgb(COLORS[index % COLORS.length]),
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