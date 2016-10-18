
import AnyWord from './AnyWord'

export const TRANSLATION_INDEX_SEPARATOR = '-'

abstract class AbstractAnyWord implements AnyWord {
    studied: boolean = true
    omitted: AnyWord
    pos: string
    en: { [ form: string ]: string } = {}
    enCount: number = 0

    abstract getIdWithoutClassifier()
    abstract getId()
    abstract toText()
    abstract getWordFact()

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
