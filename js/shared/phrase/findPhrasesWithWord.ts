import Corpus from '../Corpus'
import AnyWord from '../AnyWord'
import WordInFormMatch from './WordInFormMatch'
import ExactWordMatch from './ExactWordMatch'

export default function findPhrasesWithWord(word: AnyWord, corpus: Corpus) {
    return corpus.phrases.all().filter((phrase) => 
            !!phrase.patterns.find((pattern) => 
                !!pattern.wordMatches.find((wordMatch) => {
                    if (wordMatch instanceof WordInFormMatch) {
                        return !!wordMatch.words.find((w) => word.hasMyStem(w))
                    }

                    if (wordMatch instanceof ExactWordMatch) {
                        return !!wordMatch.words.find((w) => word.hasMyStem(w))
                    }
                })
            ))
}
