
import Phrase from '../../../shared/phrase/Phrase'
import Match from '../../../shared/phrase/Match'
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import Corpus from '../../../shared/Corpus'
import Sentence from '../../../shared/Sentence'
import { Knowledge } from '../../../shared/study/Exposure'

export default function findPhraseExamples(phrase: Phrase, corpus: Corpus, knowledge: NaiveKnowledge, sentenceCount: number) {
    let simpleMatches: Match[] = []
    let hardMatches: Match[] = []

    let start = new Date()

    let foundFragments: { [fragment: string] : boolean } = {}

    corpus.sentences.sentences.find(sentence => {
        if (!phrase.isAutomaticallyAssigned() &&
            !sentence.phrases.find((p) => p.getId() == phrase.getId())) {
            return
        }

        let match = phrase.match({
            words: sentence.words,
            sentence: sentence,
            facts: corpus.facts
        })
        
        if (match) {
            let fragment = match.words.map(w => w.word.toText()).join(' ')

            if (!foundFragments[fragment]) {
                let simple = !match.words.find(word => 
                    knowledge.getKnowledge(word.word.getWordFact()) != Knowledge.KNEW);

                (simple? simpleMatches : hardMatches).push(match)

                foundFragments[fragment] = true

                if (simpleMatches.length >= sentenceCount) {
                    return true
                }
            }

        }

    })

    return simpleMatches.concat(hardMatches).slice(0, sentenceCount)
}
