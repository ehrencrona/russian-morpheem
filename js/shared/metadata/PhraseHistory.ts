import { Event } from './Event'
import { PhraseStatus } from './PhraseStatus'
import Phrase from '../phrase/Phrase'

export interface PhraseHistory {

    setStatus(status: PhraseStatus, phraseId: string)

    getStatus(phraseId: string): Promise<PhraseStatus>
    
    getOpenPhrases(): Promise<string[]>

}