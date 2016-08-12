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
    hard: SentenceDifficulty[],
    count: number,
    factIndex: number
}

export type SentencesByFactIndex = { [factId: string]: FactSentences }; 

export function findSentencesForFact(forFact: Fact, sentences: Sentences, facts: Facts, okInterval?: number): FactSentences {
        if (okInterval == undefined) {
        okInterval = OK_INTERVAL
    } 
    
    let forFactIndex = facts.indexOf(forFact)
    let result : FactSentences = { ok: [], easy: [], hard: [], count: 0, factIndex: forFactIndex }
    
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

            result.count++        
            list.push({ sentence: sentence, difficulty: hardestIndex })
        }
    })
    
    return result
}

export function indexSentencesByFact(sentences: Sentences, facts: Facts, okInterval?: number): SentencesByFactIndex {
    let result: SentencesByFactIndex = {}
    
    if (okInterval == undefined) {
        okInterval = OK_INTERVAL
    } 

    sentences.sentences.forEach((sentence: Sentence) => {
        
        let hardestIndex = -1
        let hardestFactSentences 
        let allFactSentences: FactSentences[] = []

        sentence.visitFacts((fact) => {
            let fs = result[fact.getId()]

            if (!fs) {
                let factIndex = facts.indexOf(fact)
                
                if (factIndex < 0) {
                    return
                }
                
                fs = { easy: [], hard: [], ok: [], factIndex: factIndex, count: 0 }
                
                result[fact.getId()] = fs
            }
            
            allFactSentences.push(fs)

            if (fs.factIndex > hardestIndex) {
                hardestIndex = fs.factIndex
                hardestFactSentences = fs
            }
        })

        let sentenceDifficulty = { sentence: sentence, difficulty: hardestIndex }
    
        allFactSentences.forEach((fs) => {
            fs.count++
            
            let list

            if (hardestIndex == fs.factIndex) {
                list = fs.easy
            }
            else if (hardestIndex - fs.factIndex <= okInterval) {
                list = fs.ok
            }
            else {
                list = fs.hard
            }
    
            list.push(sentenceDifficulty)
        })
    })
    
    return result
}