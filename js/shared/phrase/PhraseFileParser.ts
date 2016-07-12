

import Words from '../Words'
import Phrase from './Phrase'
import Phrases from './Phrases'

export default function parsePhraseFile(data, words: Words): Phrases {
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

        let phrase = Phrase.fromString(
            line.substr(0, i).trim(), line.substr(j+1).trim(), 
            words)

        phrase.description = line.substr(i+3, j-i-3)

        phrases.add(phrase)
    }

    return phrases
}
