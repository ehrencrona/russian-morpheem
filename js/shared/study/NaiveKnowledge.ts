
import Fact from '../fact/Fact'
import { Exposure, Knowledge } from '../study/Exposure'

export default class NaiveKnowledge {
    known: { [ factId: string ]: Knowledge } = {}

    isEmpty() {
        for (var prop in this.known) {
            if (this.known.hasOwnProperty(prop)) {
                return false;
            }
        }

        return true
    }

    processExposures(exposures: Exposure[]) {

        exposures.forEach((exposure) => {

            if (exposure.knew != Knowledge.MAYBE) {
                this.known[exposure.fact] = exposure.knew
            }

        })

    }

    getKnowledge(fact: Fact): Knowledge {
        return this.getKnowledgeOfId(fact.getId())
    }

    getKnowledgeOfId(factId: string): Knowledge {
        let result = this.known[factId]

        if (result == undefined) {
            result = Knowledge.MAYBE
        }

        return result
    }
}