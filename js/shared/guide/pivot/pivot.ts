
import PivotDimension from './PivotDimension'

export class Pivot<PivotEntry> {
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

export function pivot<PivotEntry>(data: PivotEntry[], dimensions: PivotDimension<PivotEntry, any>[], 
        itemsPerCategoryLimit?: number, hideCategoryLimit?: number) {
    let root = new Pivot<PivotEntry>(null, null, null)

    let getPivot = (entry: PivotEntry) => {
        let at = root

        dimensions.forEach((dim, index) => {
            if (!at) {
                return
            }

            let values = dim.getValues(entry)
            let value = values && values[0]

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

    data.forEach(entry => {
        let pivot = getPivot(entry)

        if (pivot) {
            if (!itemsPerCategoryLimit 
                || pivot.entries.length < itemsPerCategoryLimit) {
                pivot.addFact(entry)
            }
            else {
                pivot.addFilteredFact()
                didFilter = true
            }
        }
    })

    if (hideCategoryLimit) {
        didFilter = root.filterChildren(pivot => pivot.lineCount > hideCategoryLimit)
    }

    return {
        root: root,
        didFilter: didFilter
    }
}

export default pivot