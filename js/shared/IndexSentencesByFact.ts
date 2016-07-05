import Sentences from './Sentences';
import Sentence from './Sentence';
import InflectableWord from './InflectableWord';
import Facts from './fact/Facts';
import Fact from './fact/Fact';

let OK_INTERVAL = 10  

export interface SentenceDifficulty {
    sentence: Sentence,
    difficulty: number
}

export interface FactSentences {
    easy: SentenceDifficulty[],
    ok: SentenceDifficulty[],
    hard: SentenceDifficulty[]
}

export function findSentencesForFact(forFact: Fact, sentences: Sentences, facts: Facts, okInterval?: number): FactSentences {
    let result : FactSentences = { ok: [], easy: [], hard: [] }
    
    if (okInterval == undefined) {
        okInterval = OK_INTERVAL
    } 
    
    let forFactIndex = facts.indexOf(forFact)
    
    sentences.sentences.forEach((sentence) => {
        let hardestIndex = -1
        let found = false

        sentence.visitFacts((fact) => {
            let factIndex = facts.indexOf(fact)

            if (fact.getId() == forFact.getId()) {
                found = true
            }

            if (factIndex > hardestIndex) {
                hardestIndex = factIndex
            }
        })
    
        if (found) {
            let list: SentenceDifficulty[]
            
            if (hardestIndex == forFactIndex) {
                list = result.easy
            }
            else if (hardestIndex - forFactIndex <= okInterval) {
                list = result.ok
            }
            else {
                list = result.hard
            }
            
            list.push({ sentence: sentence, difficulty: hardestIndex })
        }
    })
    
    return result
}

export interface FactSentenceIndex {
    easy: number,
    ok: number,
    hard: number,
    factIndex: number 
}

export type SentenceCountByFact = { [factId: string]: FactSentenceIndex }; 

export function indexSentencesByFact(sentences: Sentences, facts: Facts, okInterval?: number): SentenceCountByFact {
    let result : { [factId: string]: FactSentenceIndex } = {}
    
    if (okInterval == undefined) {
        okInterval = OK_INTERVAL
    } 

    let t = new Date().getTime();

    sentences.sentences.forEach((sentence) => {
        
        let hardestIndex = -1
        let hardestFactSentences 
        let allFactSentences = []

        sentence.visitFacts((fact) => {
            let fs = result[fact.getId()]
            
            if (!fs) {
                let factIndex = facts.indexOf(fact)
                
                if (factIndex < 0) {
                    return
                }
                
                fs = { easy: 0, hard: 0, ok: 0, factIndex: factIndex }
                
                result[fact.getId()] = fs
            }
            
            allFactSentences.push(fs)

            if (fs.factIndex > hardestIndex) {
                hardestIndex = fs.factIndex
                hardestFactSentences = fs
            }

        })
    
        allFactSentences.forEach((fs) => {
            if (hardestIndex == fs.factIndex) {
                fs.easy++
            }
            else if (hardestIndex - fs.factIndex <= okInterval) {
                fs.ok++
            }
            else {
                fs.hard++
            }
        })
    })
    
    return result
}