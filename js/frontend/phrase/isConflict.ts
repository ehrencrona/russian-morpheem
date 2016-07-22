import Sentence from '../../shared/Sentence'
import Phrase from '../../shared/phrase/Phrase'
import Facts from '../../shared/fact/Facts'

export default function isConflictFunction(phrase: Phrase, facts: Facts) {
    return (sentence: Sentence, wordIndexes: number[]) => {
        let conflictingPhrase = sentence.phrases.find((existingPhrase) =>
            phrase.id != existingPhrase.id &&
            !!existingPhrase.patterns.find((pattern) => {
                let existingMatching = pattern.match(sentence.words, facts)

                if (existingMatching) {
                    return !!wordIndexes.find((index) => existingMatching.indexOf(index) >= 0)
                }
            })
        )

        return !!conflictingPhrase
    }
}
