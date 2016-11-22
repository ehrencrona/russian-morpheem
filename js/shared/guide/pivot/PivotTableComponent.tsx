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

import { Component, createElement } from 'react';

interface Props<PivotEntry> {
    dimensions: PivotDimension<PivotEntry ,any>[],
    data: PivotEntry[]
    getFactOfEntry: (PivotEntry) => Fact
    corpus: Corpus
    hideForms?: Object,
    factLinkComponent: FactLinkComponent
    itemsPerCategoryLimit?: number
    hideCategoryLimit?: number
}

interface State {
    showAll?: boolean
}

let React = { createElement: createElement }

class Pivot<PivotEntry> {
    children: { [key: string] : Pivot<PivotEntry> } = {}
    lineCount: number = 0
    countBeforeFilter: number = 0
    entries: PivotEntry[]  = []
    
    constructor(public parent: Pivot<PivotEntry>, public key: string|number, public value) {
    }

    getChild(key: string|number, value: any) {
        let result = this.children[key]

        if (!result) {
            result = new Pivot(this, key, value)

            this.children[key] = result
        }

        return result
    }

    addFact(entry: PivotEntry) {
        this.entries.push(entry)

        let at: Pivot<PivotEntry> = this

        at.lineCount++
        at.countBeforeFilter++

        while (at.parent) {
            at.parent.lineCount++
            at.parent.countBeforeFilter++

            at = at.parent
        }
    }

    addFilteredFact() {
        let at: Pivot<PivotEntry> = this

        at.countBeforeFilter++

        while (at.parent) {
            at.parent.countBeforeFilter++

            at = at.parent
        }
    }

    childArray() {
        return Object.keys(this.children).map(c => this.children[c])
    }

    getSortedChildren() {
        return this.childArray().sort((c1, c2) => {
            return c2.countBeforeFilter - c1.countBeforeFilter
        })
    }

    filterChildren(filter: (Pivot) => boolean) {
        let didFilter = false

        this.childArray().forEach(child => {
            didFilter = didFilter || child.filterChildren(filter)

            if (!filter(child)) {
                this.lineCount -= child.lineCount

                delete this.children[child.key]
                didFilter = true
            }
        })

        return didFilter
    }
}

export default class PivotTableComponent<PivotEntry> extends Component<Props<PivotEntry>, State> {
    constructor(props) {
        super(props)

        this.state = {}
    }

    render() {
        let props = this.props
        let dimensions = props.dimensions

        let root = new Pivot<PivotEntry>(null, null, null)

        let getPivot = (entry: PivotEntry) => {
            let at = root

            dimensions.forEach((dim, index) => {
                if (!at) {
                    return
                }

                let value = dim.getValues(entry)[0]

                if (value) {
                    at = at.getChild(dim.getKey(value), value)
                }
                else {
                    at = null
                }
            })

            return at
        }

        let didFilter = false

        props.data.forEach(entry => {
            let pivot = getPivot(entry)

            if (pivot) {
                if (!props.itemsPerCategoryLimit 
                    || pivot.entries.length < props.itemsPerCategoryLimit 
                    || this.state.showAll) {
                    pivot.addFact(entry)
                }
                else {
                    pivot.addFilteredFact()
                    didFilter = true
                }
            }
        })

        if (props.hideCategoryLimit && !this.state.showAll) {
            didFilter = root.filterChildren(pivot => pivot.lineCount > props.hideCategoryLimit)
        }

        let getFactLines = (pivot: Pivot<PivotEntry>) => {
            return pivot.entries.map(entry => [ 
                <td key={ props.getFactOfEntry(entry).getId() }>
                <ul>{
                    renderRelatedFact(
                        props.getFactOfEntry(entry), 
                        props.corpus, 
                        props.factLinkComponent)
                }</ul>
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
                    dim.renderValue(pivot.value)
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
            <table className='pivot'>
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

export class FactPivotTable extends PivotTableComponent<Fact> {
} 
