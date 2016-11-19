import { toASCII } from 'punycode';
import Fact from '../../../shared/fact/Fact';
import InflectableWord from '../../../shared/InflectableWord';
import InflectedWord from '../../../shared/InflectedWord';
import Inflection from '../../../shared/inflection/Inflection';
import Word from '../../../shared/Word';
import Corpus from '../../../shared/Corpus'
import FactLinkComponent from '../fact/FactLinkComponent';
import renderRelatedFact from '../fact/renderRelatedFact';
import PivotDimension from './PivotDimension'

import { Component, createElement } from 'react';

interface Props {
    dimensions: PivotDimension<any>[],
    data: Fact[]
    corpus: Corpus
    hideForms?: Object,
    factLinkComponent: FactLinkComponent
    filterLimit?: number
}

interface State {
    showAll?: boolean
}

let React = { createElement: createElement }

export default class PivotTableComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {}
    }

    render() {
        let props = this.props

        interface Line {
            entry: Fact
            dimensionValues: any[]
        }

        let lines: Line[] = []

        function cloneLine(line: Line): Line {
            let result = Object.assign({}, line)

            result.dimensionValues = result.dimensionValues.slice(0)

            return result
        }

        props.data.forEach(entry => {
            let line: Line = {
                entry: entry,
                dimensionValues: []
            }

            let handleDimensions = (dimensionIndex: number, line: Line) => {
                let dim = props.dimensions[dimensionIndex]

                if (!dim) {
                    lines.push(line)
                }
                else {
                    let values = dim.getValues(entry)

                    line.dimensionValues[dimensionIndex] = values[0]

                    if (values.length > 1) {
                        values.forEach(value => {
                            let cloned = cloneLine(line)

                            handleDimensions(dimensionIndex + 1, cloned)
                        })
                    }
                    else if (values.length == 1) {
                        handleDimensions(dimensionIndex + 1, line)
                    }
                }
            }

            handleDimensions(0, line)
        })

        function keyString(line: Line, toIndex?: number) {
            let values = line.dimensionValues
            
            if (toIndex) {
                values = values.slice(0, toIndex)
            }
            
            return values.map((value, index) => props.dimensions[index].getKey(value)).join('')
        }

        let keyCount = {}

        for (let index = this.props.dimensions.length-1; index >= 0; index--) {
            let dim = this.props.dimensions[index]

            lines.forEach(line => {
                let key = keyString(line, index+1)

                if (!keyCount[key]) {
                    keyCount[key] = 1
                }
                else {
                    keyCount[key]++
                }
            })
        }

        lines = lines.sort((l1, l2) => {

            for (let index = 0; index < this.props.dimensions.length; index++) {
                let key1 = keyString(l1, index+1)
                let key2 = keyString(l2, index+1)
                
                let result = keyCount[key2] - keyCount[key1]

                if (result == 0) {
                    result = key1.toString().localeCompare(key2.toString())
                }

                if (result != 0) {
                    return result
                }
            }

        })

        if (this.props.filterLimit && !this.state.showAll) {
            lines = lines.filter(line => {
                return keyCount[keyString(line)] > this.props.filterLimit
            })
        }

        if (!this.state.showAll) {
            let seenCount = {}

            lines = lines.filter(l => {
                let key = keyString(l)

                if (!seenCount[key]) {
                    seenCount[key] = 1
                }
                else {
                    seenCount[key]++
                }

                return seenCount[key] < 4
            })            
        }

        return <div>
            {
                this.state.showAll 
                ?
                    <div className='seeAll' onClick={ () => this.setState({ showAll : false })}>See less</div>
                :
                    <div className='seeAll' onClick={ () => this.setState({ showAll : true })}>See all</div>
            }
            <table className='pivot'>
                <colgroup>
                    {
                        props.dimensions.concat(null).map(d => <col />)
                    }
                </colgroup>
                <tbody>
                {
                    lines.map((line, lineIndex) => {
                        let dimensionEqual = (index) => {
                            return lineIndex > 0 &&
                                props.dimensions[index].getKey(line.dimensionValues[index]) ==
                                props.dimensions[index].getKey(lines[lineIndex-1].dimensionValues[index])
                        }

                        return <tr key={ lineIndex } className={ dimensionEqual(0) ? '' : 'main' } >
                            {
                                props.dimensions.map((dim, index) => {

                                    if (dimensionEqual(index)) {
                                        return null
                                    }
                                    else {
                                        let rowSpan = 1

                                        for (let i = lineIndex+1; i < lines.length; i++) {
                                            if (props.dimensions[index].getKey(lines[i].dimensionValues[index]) !=
                                                props.dimensions[index].getKey(line.dimensionValues[index])) {
                                                break
                                            }

                                            rowSpan++
                                        }

                                        return <td key={ dim.name } rowSpan={rowSpan}>{
                                            dim.renderValue(line.dimensionValues[index])
                                        }</td>
                                    }
                                })
                            }
                            <td>
                                <ul>{
                                    renderRelatedFact(line.entry, props.corpus, props.factLinkComponent)
                                }</ul>
                            </td>
                        </tr>

                    })
                }
                </tbody>
            </table>
        </div> 
    }

}