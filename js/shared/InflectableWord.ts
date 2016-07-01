import Word from './Word'
import UnstudiedWord from './UnstudiedWord'
import InflectedWord from './InflectedWord'
import Inflection from './inflection/Inflection'
import Inflections from './inflection/Inflections'
import INFLECTION_FORMS from './inflection/InflectionForms'
import MASKS from './Masks'

interface JsonFormat {
    stem: string,
    en: string,
    inflection: string,
    type: string,
    classifier?: string,
    mask?: string
}

export default class InflectableWord {
    inflectionByForm : { [s: string]: InflectedWord } = {}
    en: string
    mask: (string) => boolean
    defaultInflection: InflectedWord

    constructor(public stem: string, public inflection: Inflection, public classifier?: string) {
        this.stem = stem
        this.inflection = inflection
        this.classifier = classifier
    }

    visitFacts(visitor: (Fact) => any) {
        visitor(this)
    }

    changeInflection(inflection: Inflection) {
        for (let form in this.inflectionByForm) {
            let oldWord = this.inflectionByForm[form]

            oldWord.jp = inflection.getInflectedForm(this.stem, oldWord.form) 
        }

        this.inflection = inflection
    }

    inflect(form: string): InflectedWord {
        // maintain object identity to make things easier when changing inflection
        let result = this.inflectionByForm[form]

        if (!result && !(this.mask && this.mask(form))) {
            let jp = this.inflection.getInflectedForm(this.stem, form)
            
            if (jp == null) {
                return
            }
            
            result = new InflectedWord(jp, form, this)

            result.classifier = this.classifier
        }

        this.inflectionByForm[form] = result

        return result
    }

    visitAllInflections(visitor: (InflectedWord) => any, excludeInherited: boolean) {
        for (let form of this.inflection.getAllForms()) {
            if (!this.mask || !this.mask(form)) {
                visitor(this.inflect(form))
            }
        }
    }

    getDefaultInflection(): InflectedWord {
        if (!this.defaultInflection) {
            let defaultForm = this.inflection.defaultForm

            if (this.mask && this.mask(defaultForm)) {
                // TODO: Russian assumed
                const LANG = 'ru'

                defaultForm = INFLECTION_FORMS[LANG][this.inflection.pos].allForms.find(
                    (form) => !this.mask(form) && this.inflection.hasForm(form))

                if (!defaultForm) {
                    throw new Error('The mask ' + this.mask + ' filtered all forms for ' + this.stem)
                }    
            }

            this.defaultInflection = this.inflect(defaultForm)
        }

        return this.defaultInflection
    }

    getId() {
        let result = this.getDefaultInflection().jp

        if (this.classifier) {
            result += '[' + this.classifier + ']' 
        }

        return result
    }

    static getJsonType() {
        return 'ib'
    }

    setEnglish(en) {
        this.en = en
        
        return this
    }

    setClassifier(classifier) {
        this.classifier = classifier

        return this
    }

    setMask(mask: (string) => boolean) {
        this.mask = mask
        this.defaultInflection = null
    }

    static fromJson(rawJson, inflections: Inflections): InflectableWord {
        let json = rawJson as JsonFormat

        let inflection = inflections.get(json.inflection)

        if (!inflection) {
            throw new Error('The inflection ' + json.inflection + ' does not exist.')
        }

        let result = new InflectableWord(
            json.stem, inflection, json.classifier)
            .setEnglish(json.en)

        if (json.mask) {
            let posMasks = MASKS[inflection.pos]

            result.setMask(posMasks[json.mask])
        }

        return result
    }

    toString() {
        return this.getId() + ' (' + this.inflection.getId() + ')'
    }

    toJson(): JsonFormat {
        let result: JsonFormat = {
            stem: this.stem,
            en: this.en,
            inflection: this.inflection.id,
            type: InflectableWord.getJsonType()
        }

        if (this.classifier) {
            result.classifier = this.classifier
        }

        if (this.mask) {
            result.mask = this.getMaskId()
        }

        return result
    }

    getMaskId() {
        let posMasks = MASKS[this.inflection.pos]

        let maskId = Object.keys(posMasks).find((key) => {
            return posMasks[key] === this.mask
        } )

        if (!maskId) {
            console.warn('Could not find the mask ' + this.mask + ' for ' + this.getId() + ' in the lists of masks.')
        }

        return maskId
    }
}