
import Fact from '../../fact/Fact'

export interface PivotDimension<V> {
    getKey(value: V): string|number

    getValues(fact: Fact): V[]

    renderValue(value: V)

    name: string
}

export default PivotDimension