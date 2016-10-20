
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

    return sentenceScores
        .filter((ss) => ss.score >= cutoff)
        // there might be many sentences with the same score
        .slice(0, count)
}
