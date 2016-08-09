
import AnyWord from './AnyWord'

abstract class AbstractAnyWord implements AnyWord {
    studied: boolean = true
    pos: string
    en: { [ form: string ]: string } = {}

    abstract getIdWithoutClassifier()
    abstract getId()
    abstract toText()

    getEnglish(form?: string) {
        if (!form) {
            form = ''
        }

        var result = this.en[form]

        if (!result) {
            return ''
        }

        return result
    }

    setEnglish(en: string, form?: string) {
        if (!form) {
            form = ''
        }

        this.en[form] = en

        return this
    }

}

export default AbstractAnyWord
