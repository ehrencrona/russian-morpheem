

import Words from '../Words'
import Phrase from './Phrase'
import Phrases from './Phrases'
import Inflections from '../inflection/Inflections'

export default function parsePhraseFile(data, words: Words, inflections: Inflections): Phrases {
    let phrases = new Phrases()

    let lineIndex = 0

    for (let line of data.split('\n')) {
        lineIndex++ 
        
        if (!line || line.substr(0, 2) == '//') {
            continue
        }

        let i = line.indexOf(': "')
        let j = line.indexOf('" ', i + 3)

        if (i < 0 || j < 0) {
            throw new Error(`Can't parse pattern ${line}. Should be id: "description" pattern`)                
        }

        let id = line.substr(0, i).trim()
        let description = line.substr(i+3, j-i-3)

        let k = line.indexOf('"', j+1)
        let l = line.indexOf('"', k+1)

        if (k < 0 || l < 0) {
            throw new Error(`Can't parse pattern ${line}. Should be id: "description" pattern`)                
        }

        let phraseEn

        phraseEn = line.substr(k+1, l-k-1)

        let m = line.indexOf('"', l+1)
        let n = line.indexOf('"', m+1)

        if (m < 0 || n < 0) {
            throw new Error(`Can't parse pattern ${line}. Should be id: "description" pattern`)                
        }
        
        let patternEn
        let pattern
        
        patternEn = line.substr(m+1, n-m-1)
        pattern = line.substr(n + 2)

        let phrase: Phrase

        try {            
            phrase = Phrase.fromString(
                id, pattern, patternEn,  
                words, inflections)
        } catch (e) {
            console.warn(e.stack)
            
            throw new Error(`In phrase ${id}: ${e.message}.`)
        }

        phrase.description = description
        phrase.en = phraseEn

        let existing = phrases.get(id)

        if (existing && pattern) {
            existing.patterns.push(phrase.patterns[0])
        }
        else {
            phrases.add(phrase)
        }
    }

    return phrases
}
