
import { ExternalSentence } from './ExternalSentence'
import Sentence from '../Sentence'
import Fact from '../fact/Fact'

export interface ExternalCorpus {
    getExternalSentences(fact: Fact): Promise<ExternalSentence[]>
    importSentence(sentence: ExternalSentence): Promise<Sentence>
}
