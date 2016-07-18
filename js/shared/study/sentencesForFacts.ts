

import FactScore from './FactScore'
import SentenceScore from './SentenceScore'

import { SentencesByFactIndex } from '../SentencesByFactIndex'

export default function sentencesForFacts(factScores: FactScore[], sentencesByFactIndex: SentencesByFactIndex): SentenceScore[] {

    let sentenceScores: SentenceScore[] = [] 

    factScores.forEach((fs) => {
        let factSentences = sentencesByFactIndex[fs.fact.getId()]

        if (factSentences) {
            factSentences.easy.concat(factSentences.ok).concat(factSentences.hard).forEach((sentence) => {
                sentenceScores.push({
                    sentence: sentence.sentence,
                    score: fs.score,
                    fact: fs.fact,
                    debug: {
                        fact: fs.debug
                    }
                })
            })
        }
    })

    return sentenceScores

}