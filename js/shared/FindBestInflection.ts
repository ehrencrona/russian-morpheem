
import Inflection from './Inflection'
import Ending from './Ending'
import Inflections from './Inflections'
import InflectableWord from './InflectableWord'
import INFLECTION_FORMS from './InflectionForms'

interface BestInflection {
    stem: string,
    inflection: Inflection,
    wrongForms: string[]
}

export function findPotentialStems(words: { [form: string]: string }, inflection: Inflection) {
    let result = []
    let resultSet = new Set() 
    
    for (let form in words) {
        let word = words[form]
        
        let ending = inflection.getEnding(form)
        
        if (ending && !ending.relativeTo && !ending.subtractFromStem) {
            if (word.substr(word.length - ending.suffix.length) == ending.suffix) {
                let candidate = word.substr(0, word.length - ending.suffix.length)
                
                if (!resultSet.has(candidate)) {
                    result.push(candidate)
                    resultSet.add(candidate)
                }
            }
        }
    }
    
    return result
}

export function getWrongForms(stem, words: { [form: string]: string }, inflection: Inflection) {
    let inflectableWord = new InflectableWord(stem, inflection)
    let wrongForms = []
    
    for (let form in words) {
        let word = words[form]
        
        if (word != inflectableWord.inflect(form).jp) {
            wrongForms.push(form)
        }
    }
    
    return wrongForms
}

export default function findBestInflection(words: { [form: string]: string }, pos, inflections: Inflections): BestInflection {
    let best: BestInflection
        
    for (let inflection of inflections.inflections) {
        if (inflection.pos == pos) {
            let potentialStems = findPotentialStems(words, inflection)

            let lowestWrong = 999
            for (let candidateStem of potentialStems) {
                let wrongForms = getWrongForms(candidateStem, words, inflection)
                
                let wrong = wrongForms.length
                let right = Object.keys(inflection.endings).length - wrong
                
                if (right >= wrong && (!best || wrong < best.wrongForms.length)) {
                    best = {
                        stem: candidateStem,
                        inflection: inflection,
                        wrongForms: wrongForms
                    }
                }
            }
        }
    }
    
    return best
}

export function generateEnding(stem, word) {
    let lastSimilar
    
    for (lastSimilar = 0; lastSimilar < Math.min(stem.length, word.length); lastSimilar++) {
        if (stem[lastSimilar] != word[lastSimilar]) {
            break
        }
    }

    let suffix
    let substractFromStem = stem.length - lastSimilar

    suffix = word.substr(lastSimilar)

    return new Ending(suffix, null, substractFromStem)
}


interface SuitableInflection {
    inflection: Inflection,
    isNew: boolean
}

export function getSuitableInflection(words: { [form: string]: string }, pos, lang, inflections: Inflections): SuitableInflection  {
    let best = findBestInflection(words, pos, inflections)
    
    if (best && best.wrongForms.length == 0) {
        return {
            inflection: best.inflection,
            isNew: false
        }
    }
    else {
        let defaultForm
        let wrongForms
        
        if (best) {
            defaultForm = best.inflection.defaultForm
            wrongForms = best.wrongForms
        }
        else {
            defaultForm = INFLECTION_FORMS[lang][pos].allForms[0]
            wrongForms = Object.keys(words)
        }
        
        let dictionaryForm = words[defaultForm]
        
        if (!dictionaryForm) {
            throw new Error(`The form "${ defaultForm }" was not specified.`)
        }

        let endings: { [s: string]: Ending } = {}
        
        for (let form of wrongForms) {
            endings[form] = generateEnding(best.stem, words[form])
        }

        let inflection = new Inflection('-' + dictionaryForm, defaultForm, pos, endings)

        if (best) {
            inflection.inherit(best.inflection)
        }

        return {
            inflection: inflection,
            isNew: true
        }
    }
}