import { PartOfSpeech } from './inflection/Dimensions';
import { exists } from 'fs';
import { getDerivations } from './inflection/WordForms';
import { WordCoordinates } from './inflection/WordForm';

import Words from './Words'
import AnyWord from './AnyWord'
import Fact from './fact/Fact'
import WordForm from './inflection/WordForm'
import * as Dimension from './inflection/Dimensions'
export const TRANSLATION_INDEX_SEPARATOR = '-'

export const MODAL_VERBS = {
    must: 1, can: 1, could: 1, may: 1, might: 1
}

export interface JsonFormat {
    en: { [ form: string ]: string },
    t: string,
    f: WordCoordinates
    cl?: string,
    unstudied?: boolean,
    d?: [string, string][]
}

export abstract class AbstractAnyWord implements AnyWord {
    studied: boolean = true
    omitted: AnyWord
    en: { [ form: string ]: string } = {}
    enCount: number = 0 
    required: Fact[]
    classifier: string

    derivations: { [ id: string ] : AnyWord[] } = {}

    wordForm: WordForm = new WordForm({ })

    abstract getIdWithoutClassifier()
    abstract getId()
    abstract toText()
    abstract getWordFact()
    abstract hasMyStem(word: AnyWord)
    abstract isPunctuation()

    constructor(classifier?: string) {
        this.classifier = classifier
    }

    requiresFact(fact: Fact) {
        if (!fact) {
            throw new Error('No fact.')
        }

        if (!this.required) {
            this.required = []
        }

        this.required.push(fact)

        return this
    }

    visitRequired(visitor) {
        if (this.required) {
            for (let fact of this.required) {
                if (fact.visitFacts) {
                    fact.visitFacts(visitor)
                }
                else {
                    visitor(fact)
                }
            }
        }
    }

    getTranslationCount() {
        return this.enCount
    }

    getDictionaryFormOfTranslation(translation: string, form?: string) {
        let key = Object.keys(this.en).find(k => this.en[k] == translation)

        if (key == null) {
            console.error(`No translation "${translation}" of ${this.getId()}.`)

            return this.getEnglish(form || '')
        }

        let els = key.split(TRANSLATION_INDEX_SEPARATOR)

        if (els.length == 1) {
            return this.getEnglish(form || '')
        }
        else {
            return this.getEnglish(form || '', parseInt(els[1])-1)
        }
    }

    getAllTranslations(): string[] {
        return Object.keys(this.en).map(k => this.en[k])
    }

    getEnglish(form?: string, translationIndex?: number) {
        if (!form) {
            form = ''
        }

        let suffix = (translationIndex ? TRANSLATION_INDEX_SEPARATOR + (translationIndex + 1) : '')
        var result = this.en[form + suffix]

        if (!result) {
            if (form == 'pastpart' || form == 'pastpl') {
                result = this.en['past' + suffix]
            }
            else {
                result = this.en[suffix]

                if (result && result.indexOf(' ') < 0) {
                    let pos = this.wordForm.pos

                    if (pos == PartOfSpeech.VERB) {
                        if (form == '3') {
                            result += 's'
                        }
                        else if (form == 'past') {
                            result += 'ed'
                        }
                        else if (form == 'prog') {
                            result += 'ing'
                        }
                    }
                    else if (pos == PartOfSpeech.NOUN) {
                        if (form == 'pl') {
                            result += 's'
                        }
                    }
                }
            }
        }

        if (form == 'inf' && result && !MODAL_VERBS[result]) {
            result = 'to ' + result
        }

        return result || ''
    }

    setEnglish(en: string, form?: string, translationIndex?: number) {
        if (!form) {
            form = ''
        }

        en = en.trim()

        if (en && en.substr(0, 3) == 'to ') {
            en = en.substr(3)
        }

        translationIndex = translationIndex || 0

        if (translationIndex >= this.enCount) {
            this.enCount = translationIndex + 1
        }

        let property = form + (translationIndex ? TRANSLATION_INDEX_SEPARATOR + (translationIndex + 1) : '')

        delete this.en[property]    

        // if we are setting a value that we can already deduce from another form there is no need to set it
        if (this.getEnglish(form, translationIndex) != en) {
            this.en[property] = en
        }

        return this
    }

    calculateEnCount() {
        this.enCount = 0

        for (let key in this.en) {
            let index

            if (key[key.length-2] == TRANSLATION_INDEX_SEPARATOR) {
                index = parseInt(key[key.length-1])-1
            }
            else {
                index = 0
            }

            if (index >= this.enCount) {
                this.enCount = index+1
            }
        }
    }

    setWordForm(wordForm: WordForm) {
        this.wordForm = new WordForm(wordForm)
    }

    resolveDerivations(json: JsonFormat, words: Words) {
        if (!json.d) {
            return 
        }

        json.d.map(([derivation, derivedId]) => {
            let derived: AnyWord = words.wordsById[derivedId] || words.inflectableWordsById[derivedId] 

            if (derived) {
                this.addDerivedWords(derivation, derived)
            }
            else {
                throw new Error(`Could not find derived word ${derivedId}.`)
            }
        })
    }

    addDerivedWords(derivation: string, ... derived: AnyWord[]) {
        let existingWords = this.derivations[derivation]

        if (!existingWords) {
            existingWords = []
        }

        this.derivations[derivation] = dedup(existingWords.concat(derived))
    }

    removeDerivedWords(derivation: string, ... derived: AnyWord[]) {
        let existingWords = this.derivations[derivation]

        if (!existingWords) {
            existingWords = []
        }

        this.derivations[derivation] = existingWords.filter(w =>
            !derived.find(w2 => w2.getId() == w.getId())
        )
    }

    getDerivedWords(derivation: string): AnyWord[] {
        return this.derivations[derivation] || []
    }

    getDerivationJson() {
        let derivationJson: [string, string][] = null

        Object.keys(this.derivations).map(d => {
            if (!derivationJson) {
                derivationJson = []
            }

            this.derivations[d].forEach(w =>
                derivationJson.push([d, w.getId()])
            )
        })

        return derivationJson
    }

}

export default AbstractAnyWord

function dedup(words: AnyWord[]) {
    let seen = {}

    return words.filter(fact => {
        if (!fact) {
            return false
        }

        let result = !seen[fact.getId()]

        seen[fact.getId()] = true
        
        return result
    })
}
