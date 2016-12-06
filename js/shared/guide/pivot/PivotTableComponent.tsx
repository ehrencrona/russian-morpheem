import AnyWord from '../../AnyWord';
import { AbstractAnyWord } from '../../AbstractAnyWord';
import { WSAECANCELLED } from 'constants';
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
import { pivot, Pivot } from './pivot'

import { Component, createElement } from 'react';

interface Props<PivotEntry> {
    data: PivotEntry[]
    dimensions: PivotDimension<PivotEntry, any>[],
    getIdOfEntry: (PivotEntry) => string,
    renderEntry: (PivotEntry) => any,
    itemsPerCategoryLimit?: number,
    hideCategoryLimit?: number,
    className?: string
}

interface State {
    showAll?: boolean
}

let React = { createElement: createElement }

export default class PivotTableComponent<PivotEntry> extends Component<Props<PivotEntry>, State> {
    constructor(props) {
        super(props)

        this.state = {}
    }

    render() {
        let props = this.props
        let dimensions = props.dimensions

        let { root, didFilter } = 
            pivot(props.data, props.dimensions, 
                props.itemsPerCategoryLimit, props.hideCategoryLimit)

        let getFactLines = (pivot: Pivot<PivotEntry>) => {
            return pivot.entries.map(entry => [ 
                <td key={ props.getIdOfEntry(entry) }>
                { props.renderEntry(entry) }
            </td> ])
        }

        let getLines = (pivot: Pivot<PivotEntry>, dimensionIndex: number) => {
            let childLines: any[][] 

            if (dimensionIndex == dimensions.length-1) {
                childLines = getFactLines(pivot)
            }
            else {
                childLines = []
                
                pivot.getSortedChildren().forEach(child => childLines = childLines.concat(getLines(child, dimensionIndex+1))) 
            }

            if (dimensionIndex >= 0) {
                let dim = dimensions[dimensionIndex]

                let cell = <td key={ pivot.key } rowSpan={ pivot.lineCount }>{
                    dim.renderValue(pivot.value, dimensionIndex)
                }</td>

                childLines[0] = [
                    cell 
                ].concat(childLines[0])
            }

            return childLines
        }

        return <div>
            {
                this.state.showAll 
                ?
                    <div className='seeAll' onClick={ () => this.setState({ showAll : false })}>See less</div>
                :
                    <div className='seeAll' onClick={ () => this.setState({ showAll : true })}>See all</div>
            }
            <table className={ 'pivot ' + this.props.className || ''} >
                <colgroup>
                    {
                        props.dimensions.concat(null).map((d, index) => <col key={ index }/>)
                    }
                </colgroup>
                <tbody>
                {
                    getLines(root, -1).map((line, index) => <tr key={ index }>{ line }</tr>)
                }
                </tbody>
            </table>
        </div> 
    }
}

export function renderFactEntry(corpus: Corpus, factLinkComponent: FactLinkComponent) {
    return entry => <ul> {
        renderRelatedFact(
            entry, 
            corpus, 
            factLinkComponent)
    }</ul>
}

export function renderFactEntryWithDerivation(corpus: Corpus, derivation: string, factLinkComponent: FactLinkComponent) {
    return (entry: Fact) => {
        let derived: AnyWord

        if (entry instanceof AbstractAnyWord) {
            derived = entry.getDerivedWords(derivation)[0]
        }

        return <ul className='factEntryWithDerivation'>{
            renderRelatedFact(
                entry, 
                corpus, 
                factLinkComponent)
        }{
            derived && renderRelatedFact(
                derived.getWordFact(), 
                corpus, 
                factLinkComponent)
        }</ul>

    } 
}

export class FactPivotTable extends PivotTableComponent<Fact> {
} 
