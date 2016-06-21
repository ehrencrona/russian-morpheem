
import { ExternalSentence } from './ExternalSentence'
import Fact from '../Fact'

export interface ExternalCorpus {
    getExternalSentences(fact: Fact): Promise<ExternalSentence[]>
}
