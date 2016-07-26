import Sentence from '../../shared/Sentence'
import Phrase from '../../shared/phrase/Phrase'
import Facts from '../../shared/fact/Facts'

export default function isConflictFunction(phrase: Phrase, facts: Facts) {
    return (sentence: Sentence, wordIndexes: number[]) => {
        let conflictingPhrase = sentence.phrases.find((existingPhrase) =>
            phrase.id != existingPhrase.id &&
            !!existingPhrase.patterns.find((pattern) => {
                let match = pattern.match(sentence.words, facts)

                if (match) {
                    return !!match.find((m) => wordIndexes.indexOf(m.index) >= 0)
                }
            })
        )

        return !!conflictingPhrase
    }
}
