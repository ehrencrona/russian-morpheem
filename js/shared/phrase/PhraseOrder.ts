
import Phrase from './Phrase'
import Phrases from './Phrases'
import PhrasePattern from './PhrasePattern'

export default class PhraseOrder { 
    phrases: Phrase[] = []
    positionById: { [id: string] : number} = {}

    constructor(phrases: Phrases) {
        let left = phrases.all()

        while (left.length > 0) {
            let foundCount = 0

            let examine = (phrase: Phrase, index: number) => {
                if (!phrase.getDependencies().find(
                        (dependency) => this.positionById[dependency.getId()] == null)) {
                    this.add(phrase)
                    left[index] = null

                    foundCount++
                }
            }

            // first, do the auto-assigned ones that we want early in the ordering 
            // so they aren't knocked out on cache invalidations
            left.forEach((phrase, index) => {
                if (phrase.isAutomaticallyAssigned()) {
                    examine(phrase, index)
                }
            })

            left.forEach((phrase, index) => {
                if (phrase && !phrase.isAutomaticallyAssigned()) {
                    examine(phrase, index)
                }
            })

            if (foundCount == 0) {
                console.warn('Phrase dependencies are circular')

                this.add(left[0])
                left[0] = null
            }

            left = left.filter(p => !!p)
        }
    }

    add(phrase: Phrase) {
        let position = this.phrases.length
        this.phrases.push(phrase)
        this.positionById[phrase.getId()] = position
    }
}
