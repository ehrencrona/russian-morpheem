
import Sentence from '../Sentence'
import Fact from '../fact/Fact'

interface SentenceScore {
    sentence: Sentence,
    fact: Fact,
    score: number,
    debug?: { [id: string]: any }
}

export default SentenceScore