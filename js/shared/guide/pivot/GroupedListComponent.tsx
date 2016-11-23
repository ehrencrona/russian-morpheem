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
    renderGroup: (entry: any, children: any) => any,
    itemsPerGroupLimit?: number,
    hideCategoryLimit?: number,
    groupLimit?: number
}

interface State {
    showAll?: boolean
}

let React = { createElement: createElement }

export default class GroupedListComponent<PivotEntry> extends Component<Props<PivotEntry>, State> {
    constructor(props) {
        super(props)

        this.state = {}
    }

    render() {
        let props = this.props
        let dimensions = props.dimensions
        let itemsPerGroupLimit = props.itemsPerGroupLimit

        let { root, didFilter } = 
            pivot(props.data, props.dimensions, 
                itemsPerGroupLimit, props.hideCategoryLimit)

        let renderGroup = (pivot: Pivot<PivotEntry>, lines: any[], itemsPerNode: number, 
                leafIndex: number, dimensionIndex: number) => {
            if (lines.length >= itemsPerGroupLimit) {
                return
            }

            let itemCount = 
                Math.max(
                    Math.min(
                        Math.ceil((leafIndex + 1) * itemsPerNode) - lines.length,
                        itemsPerGroupLimit - lines.length),
                    1)

            pivot.entries.slice(0, itemCount).forEach(
                entry => lines.push(props.renderEntry(entry))
            )

            pivot.getSortedChildren().forEach(child => 
                leafIndex = renderGroup(child, lines, itemsPerNode, leafIndex, dimensionIndex+1))

            let isLeaf = dimensions.length - 1 == dimensionIndex

            return leafIndex + (isLeaf ? 1 : 0)
        }

        let children = root.getSortedChildren()

        if (props.groupLimit) {
            children = children.slice(0, props.groupLimit)
        }

        return <div className='groupedList'>
            {
                this.state.showAll 
                ?
                    <div className='seeAll' onClick={ () => this.setState({ showAll : false })}>See less</div>
                :
                    <div className='seeAll' onClick={ () => this.setState({ showAll : true })}>See all</div>
            }
            {
            children.map((group, index) => {
                let lines = []

                let itemsPerNode: number = 99

                if (itemsPerGroupLimit) {
                    itemsPerNode = calculateItemsPerNode(root, dimensions.length, itemsPerGroupLimit)
                }

                renderGroup(group, lines, itemsPerNode, 0, 0)

                return this.props.renderGroup(
                    dimensions[0].renderValue(group.value),
                    lines
                )
            })
        }</div>
    }
}

export function renderFactEntry(entry: Fact, corpus: Corpus, factLinkComponent: FactLinkComponent) {
    return <ul> {
        renderRelatedFact(
            entry, 
            corpus, 
            factLinkComponent)
    }</ul>
}

/**
 * Given that we want at most entryLimit entries in total, how many entries can we take from each node?
 * If there are enough entries in each node, it's entryLimit divided by the number of nodes, but if
 * entries are unqueally distributed it's more complicated.
 * This will not be a round number, but a fraction.
 */
export function calculateItemsPerNode(pivot: Pivot<any>, dimensionCount: number, entryLimit: number) {
    let countLeaves = (pivot: Pivot<any>, leafCount: number, dimensionIndex: number) => {
        let isLeaf = dimensionIndex == dimensionCount - 1 

        pivot.childArray().forEach(child => 
            leafCount = countLeaves(child, leafCount, dimensionIndex+1))

        return leafCount + (isLeaf ? 1 : 0)
    }

    let leafCount = countLeaves(pivot, 0, 0)

    if (leafCount == 0) {
        return 0
    }

    let interval = [
        entryLimit / leafCount,
        Math.max(entryLimit - (leafCount - 1), entryLimit) 
    ]

    if (interval[0] >= interval[1]) {
        return interval[0]
    }

    // given that we take (index of this object) items from each node, 
    // how many will we take in total?
    let totalCountByPerNodeCount = {}

    let calculatePerNodeCount = (pivot: Pivot<any>) => {
        for (let perNodeCount = Math.floor(interval[0]); perNodeCount <= interval[1]; perNodeCount++) {
            totalCountByPerNodeCount[perNodeCount] =
                (totalCountByPerNodeCount[perNodeCount] || 0) + 
                Math.min(pivot.entries.length, perNodeCount)
        }

        pivot.childArray().forEach(child => calculatePerNodeCount(child))
    }

    calculatePerNodeCount(pivot)

    for (let i = Math.floor(interval[0]); i < interval[1]; i++) {
        if (totalCountByPerNodeCount[i+1] > entryLimit) {
            let overshoot = totalCountByPerNodeCount[i+1] - entryLimit
            let undershoot = entryLimit - totalCountByPerNodeCount[i] 

            return i + undershoot / (overshoot + undershoot) 
        }
    }

    return interval[1]
}