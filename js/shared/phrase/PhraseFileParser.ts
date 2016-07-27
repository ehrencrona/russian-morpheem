

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
        let j = line.indexOf('" ', i + 2)

        if (i < 0 || j < 0) {
            throw new Error(`Can't parse pattern ${line}. Should be id: "description" pattern`)                
        }

        let description = line.substr(i+3, j-i-3)

        let k = line.indexOf('"', j+1)
        let l = line.indexOf('"', k+1)

        let en = ''
        let wordString

        if (k >= 0) {
            en = line.substr(k+1, l-k-1)
            wordString = line.substr(l + 2)
        }
        else {
            wordString = line.substr(j+1).trim()
        }

        let id = line.substr(0, i).trim()
        
        let phrase: Phrase

        try {            
            phrase = Phrase.fromString(
                id, wordString, en,  
                words, inflections)
        } catch (e) {
            console.warn(e.stack)
            
            throw new Error(`In phrase ${id}: ${e.message}.`)
        }

        phrase.description = description

        let existing = phrases.get(id)

        if (existing) {
            existing.patterns.push(phrase.patterns[0])
        }
        else {
            phrases.add(phrase)
        }
    }

    return phrases
}
