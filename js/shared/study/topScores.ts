
import SentenceScore from './SentenceScore'

interface Score {
    score: number
}

export default function topScores<S extends Score>(sentenceScores: S[], count): S[] {
    let scores: number[] = sentenceScores.map((ss) => ss.score).sort()

    let cutoff = scores[scores.length-count]

    if (!cutoff) {
        cutoff = 0
    }

    return sentenceScores.filter((ss) => ss.score >= cutoff)
}
