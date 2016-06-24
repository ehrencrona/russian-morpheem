
import { ExternalSentence } from './ExternalSentence'
import Sentence from '../Sentence'
import Fact from '../Fact'

export interface ExternalCorpus {
    getExternalSentences(fact: Fact): Promise<ExternalSentence[]>
    importSentence(sentence: ExternalSentence): Promise<Sentence>
}
