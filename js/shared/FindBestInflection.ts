
import Inflection from './Inflection'
import Ending from './Ending'
import Inflections from './Inflections'
import InflectableWord from './InflectableWord'
import INFLECTION_FORMS from './InflectionForms'

interface BestInflection {
    stem: string,
    inflection: Inflection,
    wrongForms: string[],
    missingForms: string[],
    rightForms: number
}

interface GeneratedInflection {
    inflection: Inflection,
    stem: string,
    isNew: boolean
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
    let right = 0, missingForms = []

    for (let form in words) {
        let word = words[form]

        let ending = inflection.getEnding(form)
        let inflected: string
        
        if (!ending) {
            inflected = ''
        }
        else if (!ending.relativeTo) {
            inflected = inflectableWord.inflect(form).jp
        }
        else {
            // assuming we fixed the relative to form, would this form still be broken?
            inflected = inflection.addSuffix(
                words[ending.relativeTo], ending)
        }

        if (!inflected) {
            missingForms.push(form)
        }
        else if (word != inflected) {
            wrongForms.push(form)
        }
        else {
            right++
        }
    }

    return { wrongForms: wrongForms, right: right, missingForms: missingForms }
}

export default function findBestExistingInflection(words: { [form: string]: string }, pos, inflections: Inflections): BestInflection {
    let best: BestInflection
        
    for (let inflection of inflections.inflections) {
        if (inflection.pos == pos) {
            let potentialStems = findPotentialStems(words, inflection)

            let lowestWrong = 999

            for (let candidateStem of potentialStems) {
                let wf = getWrongForms(candidateStem, words, inflection)
                let wrongForms = wf.wrongForms
                let right = wf.right
                let wrong = wrongForms.length

                if (right >= wrong && (!best || right > best.rightForms)) {
                    best = {
                        stem: candidateStem,
                        inflection: inflection,
                        wrongForms: wrongForms,
                        missingForms: wf.missingForms,
                        rightForms: right
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

function mostCommon(strings: string[]) {
    let counts : { [str: string] : number } = {}
    let highest = 0
    
    strings.forEach((string) => {
        let count = counts[string]
        
        if (count) {
            count++
        } 
        else {
            count = 1
        }
        
        if (count > highest) {
            highest = count
        }
        
        counts[string] = count
    })
    
    return {
        str: Object.keys(counts).find((str) => counts[str] == highest),
        count: highest
    }
}

export function findStem(words: { [form: string]: string }) {
    let wordArray: string[] = Object.keys(words).map((form) => words[form])
    
    let shortestLength = wordArray.reduce(
        (val, word) => Math.min(word.length, val), 999)
    
    let stemLength = 0
    let stem = ''
    
    for (let i = 0; i < shortestLength; i++) {
        let mc = mostCommon(wordArray.map((word) => word.substr(0, i+1)))

        if (mc.count < wordArray.length / 2) {
            break
        }

        stemLength = i+1;
        stem = mc.str
    }

    return stem
}

function buildInflection(id, stem, forms: string[], words: { [form: string]: string }, defaultForm: string, pos: string) {
    let endings: { [s: string]: Ending } = {}

    for (let form of forms) {
        if (words[form] != null) {
            endings[form] = generateEnding(stem, words[form])
        }
    }

    return new Inflection(id, defaultForm, pos, endings)
}

export function generateInflection(words: { [form: string]: string }, pos: string, lang: string, inflections: Inflections): GeneratedInflection  {
    let best = findBestExistingInflection(words, pos, inflections)

    if (best && best.wrongForms.length == 0 && best.missingForms.length == 0) {
        return {
            inflection: best.inflection,
            stem: best.stem,
            isNew: false
        }
    }
    else if (best) {
        let defaultForm = best.inflection.defaultForm

        let dictionaryForm = words[defaultForm]

        if (!dictionaryForm) {
            throw new Error(`The form "${ defaultForm }" was not specified.`)
        }

        let inflection = buildInflection('-' + dictionaryForm, best.stem, best.wrongForms.concat(best.missingForms), words, defaultForm, pos)
        inflection.inherit(best.inflection)

        return {
            inflection: inflection,
            stem: best.stem,
            isNew: true
        }
    }
    else {
        let allForms = INFLECTION_FORMS[lang][pos].allForms
        
        let defaultForm = allForms[0]
        let wrongForms = allForms

        let dictionaryForm = words[defaultForm]

        if (!dictionaryForm) {
            throw new Error(`The form "${ defaultForm }" was not specified.`)
        }

        let stem = findStem(words)

        let inflection = buildInflection('-' + dictionaryForm, stem, allForms, words, defaultForm, pos)

        return {
            inflection: inflection,
            stem: stem,
            isNew: true
        }
    }}