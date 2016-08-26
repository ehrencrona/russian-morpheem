import Sentence from '../../shared/Sentence'
import Phrase from '../../shared/phrase/Phrase'
import Facts from '../../shared/fact/Facts'

export default function isConflictFunction(phrase: Phrase, facts: Facts) {
    return (sentence: Sentence, wordIndexes: number[]) => {
        let conflictingPhrase = sentence.phrases.find((existingPhrase) =>
            phrase.id != existingPhrase.id &&
            !!existingPhrase.patterns.find((pattern) => {
                let match = pattern.match({ sentence: sentence, words: sentence.words, facts: facts })

                if (match) {
                    return !!match.words.find((m) => wordIndexes.indexOf(m.index) >= 0)
                }
            })
        )

        return !!conflictingPhrase
    }
}
