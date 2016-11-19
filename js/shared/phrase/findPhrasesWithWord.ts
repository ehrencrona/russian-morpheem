import Corpus from '../Corpus'
import AnyWord from '../AnyWord'
import WordInFormMatch from './WordInFormMatch'
import ExactWordMatch from './ExactWordMatch'

export default function findPhrasesWithWord(word: AnyWord, corpus: Corpus) {
    return corpus.phrases.all().filter((phrase) =>
        phrase.getWords().find(w => word.getWordFact().getId() == w.getWordFact().getId()))
}
