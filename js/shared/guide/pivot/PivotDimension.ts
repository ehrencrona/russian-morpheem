
import Fact from '../../fact/Fact'

export interface PivotDimension<PivotEntry, V> {
    getKey(value: V): string|number

    getValues(fact: PivotEntry): V[]

    renderValue(value: V, valueIndex: number)

    name: string
}

export default PivotDimension