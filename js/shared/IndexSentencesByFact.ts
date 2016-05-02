import Sentences from './Sentences';
import Sentence from './Sentence';
import InflectedWord from './InflectedWord';
import Facts from './Facts';
import Fact from './Fact';

const OK_INTERVAL = 10  

export interface FactSentences {
    easy: Sentence[],
    ok: Sentence[],
    hard: Sentence[]
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

        // if this is an inflected form (we treat the default form as representing the inflection as a fact)
        // we will never find it by matching indvidual facts.
        if (forFact instanceof InflectedWord && forFact.form != forFact.inflection.defaultForm) {
            found = !!sentence.words.find((word) => word.getId() == forFact.getId())
        }
        else {            
            sentence.visitFacts((fact) => {
                let factIndex = facts.indexOf(fact)

                if (factIndex < 0) {
                    return
                }

                if (fact.getId() == forFact.getId()) {
                    found = true
                }

                if (factIndex > hardestIndex) {
                    hardestIndex = factIndex
                }
            })
        }
    
        if (found) {
            let list
            
            if (hardestIndex == forFactIndex) {
                list = result.easy
            }
            else if (hardestIndex - forFactIndex <= okInterval) {
                list = result.ok
            }
            else {
                list = result.hard
            }
            
            list.push(sentence)
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

export function indexSentencesByFact(sentences: Sentences, facts: Facts, okInterval?: number): { [factId: string]: FactSentenceIndex } {
    let result : { [factId: string]: FactSentenceIndex } = {}
    
    if (okInterval == undefined) {
        okInterval = OK_INTERVAL
    } 
    
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