import { AbstractAnyWord } from '../../shared/AbstractAnyWord';
import InflectionFact from '../../shared/inflection/InflectionFact';
import Phrase from '../../shared/phrase/Phrase';
import Exposures from '../../shared/study/Exposures';
import Progress from '../../shared/study/Progress';

/// <reference path="../../../typings/chart-js.d.ts" />
/// <reference path="../../../typings/human-time.d.ts" />

import { Component, createElement } from 'react'
import { SentencesByDate, SentencesByAuthor } from '../../shared/metadata/SentencesByDate'
import Corpus from '../../shared/Corpus'
import { Chart } from 'chart.js';
import human = require('human-time');

const COLORS = [
    '31c8c7',
    'f0af33',
    '766db0',
    'a0a0a0'
]

interface Props {
    exposures: Exposures
    corpus: Corpus
}

interface ProgressByType {
    phrases: Progress,
    words: Progress,
    forms: Progress
}

interface State {
    progresses?: ProgressByType[],
}

let React = { createElement: createElement }

function toTransparentRgb(hexColor) {
    let r = parseInt(hexColor.substr(0,2), 16)
    let g = parseInt(hexColor.substr(2,2), 16)
    let b = parseInt(hexColor.substr(4,2), 16)

    return `rgba(${r},${g},${b},0.1)`
}

export default class ProgressGraphComponent extends Component<Props, State> {
    chart: Chart

    constructor(props) {
        super(props)

        this.state = { }
    }

    renderGraph(canvas: HTMLCanvasElement) {
        if (!canvas) {
            console.warn('no canvas?')

            return
        }

        if (this.chart) {
            this.chart.destroy();
        }

        let datasets = [];

        let index = 0;

        [ 'phrases', 'words', 'forms' ].forEach(type =>
        {
            datasets.push({
                borderColor: '#' + COLORS[index % COLORS.length],
                borderWidth: 2,
                backgroundColor: toTransparentRgb(COLORS[index % COLORS.length]),
                data: this.state.progresses.map(p => p[type].known.length),
                label: 'known ' + type  
            })

            index++
        })

        datasets.push({
            borderColor: '#' + COLORS[index % COLORS.length],
            borderWidth: 2,
            backgroundColor: toTransparentRgb(COLORS[index % COLORS.length]),
            data: this.state.progresses.map(p => 
                p.forms.studying.length + p.phrases.studying.length + p.words.studying.length),
            label: 'studying'
        })


        let lastDay = new Date().getTime() - 24 * 60 * 60 * 1000

        let chartData = {
            type: 'line',
            options: {
                scales: {
                    yAxes: [{
                        stacked: true
                    }]
                },
                legend: {
                    display: false
                }
            },
            data: {
                labels: this.state.progresses.map(p => {
                    let date = new Date(p.forms.date)

                    let result = human(date)

                    if (date.getTime() > lastDay) {
                        result = 'today'
                    }

                    return result
                }),
                datasets: datasets
            }
        }

        this.chart = new Chart(canvas.getContext('2d'), chartData);        
    }

    componentDidMount() {
        this.props.exposures.getProgress(-1).then(
            (progresses) => this.setState({ progresses: progresses.map(p => this.splitByType(p)) }))
            .catch((e) => console.error(e.stack))
    }

    render() {
        if (!this.state || !this.state.progresses) {
            return <div/>
        }

        return <div>            
            <canvas ref={ (canvas) => this.renderGraph(canvas) }></canvas>
        </div>
    }

    splitByType(progress: Progress) {
        function emptyProgress(): Progress {
            return {
                known: [],
                studying: [],
                unknown: [],
                date: progress.date
            }
        }

        let result: ProgressByType = {
            phrases: emptyProgress(),
            words: emptyProgress(),
            forms: emptyProgress()
        };

        [ 'known', 'studying' ].map(kind => {

            progress[kind].forEach(factId => {

                let fact = this.props.corpus.facts.get(factId)

                if (fact instanceof Phrase) {
                    result.phrases[kind].push(factId)
                }
                else if (fact instanceof InflectionFact) {
                    result.forms[kind].push(factId)
                }
                else if (fact instanceof AbstractAnyWord) {
                    result.words[kind].push(factId)
                }
            })

        })

        return result
    }
}