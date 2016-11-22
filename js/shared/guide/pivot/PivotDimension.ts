
import Fact from '../../fact/Fact'

export interface PivotDimension<PivotEntry, V> {
    getKey(value: V): string|number

    getValues(fact: PivotEntry): V[]

    renderValue(value: V)

    name: string
}

export default PivotDimension