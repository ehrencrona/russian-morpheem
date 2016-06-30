
import InflectedWord from '../shared/InflectedWord'

export interface Transform {

    isApplicable(stem: string, suffix: string) 

    apply(suffix: string) 

    getId(): string

}