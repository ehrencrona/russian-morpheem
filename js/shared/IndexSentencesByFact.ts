import Sentences from './Sentences';
import Facts from './Facts';

const OK_INTERVAL = 10  

interface FactSentences {
    easy: number,
    ok: number,
    hard: number,
    factIndex: number 
}

export default function indexSentencesByFact(sentences: Sentences, facts: Facts, okInterval?: number) {
    let result : { [factId: string]: FactSentences } = {}
    
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
                fs = { easy: 0, hard: 0, ok: 0, factIndex: facts.indexOf(fact) }
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