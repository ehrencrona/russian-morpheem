
import InflectedWord from '../shared/InflectedWord'
import Fact from './fact/Fact'
import Ending from './Ending'

interface Transform extends Fact {

    isApplicable(stem: string, suffix: Ending) 

    apply(suffix: string)

    getId(): string

}

export default Transform