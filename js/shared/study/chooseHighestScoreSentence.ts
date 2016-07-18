
import SentenceScore from './SentenceScore'

export default function chooseHighestScoreSentence(sentenceScores: SentenceScore[]): SentenceScore {

    let chosenSentence
    let highestScore = -1

    sentenceScores.forEach((sentenceScore) => {
        let score = sentenceScore.score

        if (score > highestScore) {
            chosenSentence = sentenceScore
            highestScore = score
        }
    })

    return chosenSentence
}
