
import InflectedWord from '../shared/InflectedWord'
import Fact from './fact/Fact'

interface Transform extends Fact {

    isApplicable(stem: string, suffix: string) 

    apply(suffix: string) 

    getId(): string

}

export default Transform