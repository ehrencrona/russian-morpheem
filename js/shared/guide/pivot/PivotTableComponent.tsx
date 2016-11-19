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
}

interface State {
}

let React = { createElement: createElement }

export default class PivotTableComponent extends Component<Props, State> {

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

        lines = lines.sort((l1, l2) => {
            function keyString(line: Line) {
                return line.dimensionValues.map((value, index) => props.dimensions[index].getKey(value)).join('')
            }

            return keyString(l1).localeCompare(keyString(l2))
        })

        return <table className='pivot'><tbody>
        {
            lines.map((line, lineIndex) => {
                    
                return <tr key={ lineIndex } >
                    {
                        props.dimensions.map((dim, index) => {

                            if (lineIndex > 0 &&
                                props.dimensions[index].getKey(line.dimensionValues[index]) ==
                                props.dimensions[index].getKey(lines[lineIndex-1].dimensionValues[index])) {
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
        </tbody></table>

    }

}