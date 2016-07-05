
import { Exposure } from '../study/Exposure'

export default class LastSawSentenceKnowledge {

    lastSawSentence: { [sentenceId: number]: Date } = {}

    processExposures(exposures: Exposure[]) {

        exposures.forEach((exposure) => {

            this.lastSawSentence[exposure.sentence] = exposure.time

        })

    }
} 