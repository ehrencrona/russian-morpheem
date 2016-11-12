
import AnyWord from './AnyWord'
import Fact from './fact/Fact'

export const TRANSLATION_INDEX_SEPARATOR = '-'

abstract class AbstractAnyWord implements AnyWord {
    studied: boolean = true
    omitted: AnyWord
    pos: string
    en: { [ form: string ]: string } = {}
    enCount: number = 0
    required: Fact[]

    abstract getIdWithoutClassifier()
    abstract getId()
    abstract toText()
    abstract getWordFact()
    abstract hasMyStem(word: AnyWord)

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

    getEnglish(form?: string, translationIndex?: number) {
        if (!form) {
            form = ''
        }

        let suffix = (translationIndex ? TRANSLATION_INDEX_SEPARATOR + (translationIndex + 1) : '')
        var result = this.en[form + suffix]

        if (!result) {
            result = this.en[suffix]

            if (!result) {
                result = ''
            }
        }

        if (form == 'inf') {
            result = 'to ' + result
        }

        return result
    }

    setEnglish(en: string, form?: string, translationIndex?: number) {
        if (!form) {
            form = ''
        }

        translationIndex = translationIndex || 0

        if (translationIndex >= this.enCount) {
            this.enCount = translationIndex + 1
        }

        let property = form + (translationIndex ? TRANSLATION_INDEX_SEPARATOR + (translationIndex + 1) : '')

        if (!en) {
            delete this.en[property]    
        }
        else {
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
}

export default AbstractAnyWord
