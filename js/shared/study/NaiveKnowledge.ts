
import Fact from '../fact/Fact'
import { Exposure, Knowledge } from '../study/Exposure'

export default class NaiveKnowledge {
    known: { [ factId: string ]: Knowledge } = {}

    processExposures(exposures: Exposure[]) {

        exposures.forEach((exposure) => {

            if (exposure.knew != Knowledge.MAYBE) {
                this.known[exposure.fact] = exposure.knew
            }

        })

    }

    getKnowledge(fact: Fact) {
        return this.getKnowledgeOfId(fact.getId())
    }

    getKnowledgeOfId(factId: string) {
        let result = this.known[factId]

        if (result == undefined) {
            result = Knowledge.MAYBE
        }

        return result
    }
}