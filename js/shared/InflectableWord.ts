import Word from './Word'
import InflectedWord from './InflectedWord'
import Inflection from './inflection/Inflection'
import Inflections from './inflection/Inflections'
import { WordForm, WordCoordinates } from './inflection/WordForm'
import { INFLECTION_FORMS } from './inflection/InflectionForms'
import { PartOfSpeech } from './inflection/Dimensions'
import MASKS from './Masks'
import AbstractAnyWord from './AbstractAnyWord'
import { JsonFormat as AbstractJsonFormat } from './AbstractAnyWord'
import AnyWord from './AnyWord'

export interface JsonFormat extends AbstractJsonFormat {
    stem: string,
    i: string,
    mask?: string
}

export default class InflectableWord extends AbstractAnyWord {
    inflectionByForm : { [s: string]: InflectedWord } = {}
    mask: (string) => boolean
    defaultInflection: InflectedWord

    constructor(public stem: string, public inflection: Inflection, classifier?: string) {
        super(classifier)
        this.wordForm = new WordForm(inflection.wordForm)
    }

    visitFacts(visitor: (Fact) => any) {
        visitor(this)
    }

    inflect(form: string): InflectedWord {
        // maintain object identity to make things easier when changing inflection
        let result = this.inflectionByForm[form]

        if (!result && !(this.mask && this.mask(form))) {
            try {
                let inflected = this.inflection.getInflectedForm(this.stem, form)
                
                if (inflected == null) {
                    return
                }

                result = new InflectedWord(inflected.form, form, this)

                inflected.transforms.forEach((transform) => 
                    result.requiresFact(transform))

                result.en = this.en
                result.enCount = this.enCount
                result.wordForm = this.wordForm

                result.classifier = this.classifier
                result.studied = this.studied
            }
            catch (e) {
                throw new Error(`While inflecting ${this.stem}: ${e}`)
            }
        }

        this.inflectionByForm[form] = result

        return result
    }

    visitAllInflections(visitor: (InflectedWord) => any) {
        for (let form of this.inflection.getAllForms()) {
            if (!this.mask || !this.mask(form)) {
                let inflected = this.inflect(form)

                if (inflected) {
                    visitor(inflected)
                }
            }
        }
    }

    getDefaultInflection(): InflectedWord {
        if (!this.defaultInflection) {
            let defaultForm = this.inflection.defaultForm

            if (this.mask && this.mask(defaultForm)) {
                // TODO: Russian assumed
                const LANG = 'ru'

                defaultForm = INFLECTION_FORMS[this.inflection.wordForm.pos].allForms.find(
                    (form) => !this.mask(form) && this.inflection.hasForm(form))

                if (!defaultForm) {
                    throw new Error('The mask ' + this.mask + ' filtered all forms for ' + this.stem)
                }    
            }

            this.defaultInflection = this.inflect(defaultForm)

            if (!this.defaultInflection) {
                throw new Error(`The default inflection ${defaultForm} of the inflection ${this.inflection.id} for ${this.stem} did not exist.`)
            }
        }

        return this.defaultInflection
    }

    getIdWithoutClassifier() {
        return this.getDefaultInflection().jp
    }

    getId() {
        let result = this.getIdWithoutClassifier()

        if (this.classifier) {
            result += '[' + this.classifier + ']' 
        }

        return result
    }

    static getJsonType() {
        return 'ib'
    }

    setClassifier(classifier) {
        this.classifier = classifier

        return this
    }

    setMask(mask: (string) => boolean) {
        this.mask = mask
        this.defaultInflection = null
    }

    static fromJson(json: JsonFormat, inflections: Inflections): InflectableWord {
        let inflection = inflections.get(json.i)

        if (!inflection) {
            throw new Error('The inflection ' + json.i + ' does not exist.')
        }

        let result = new InflectableWord(
            json.stem, inflection, json.cl)
            
        result.en = json.en

        result.calculateEnCount()

        if (json.mask) {
            let posMasks = MASKS[inflection.wordForm.pos]

            result.setMask(posMasks[json.mask])
        }

        if (json.unstudied) {
            result.studied = false
        }

        result.wordForm = new WordForm(json.f)

        return result
    }

    hasMyStem(word: AnyWord) {
        return word.getId() == this.getId() || (
            word instanceof InflectedWord &&
            word.word.getId() == this.getId()
        )
    }

    toString() {
        return this.getId() + ' (' + this.inflection.getId() + ')'
    }

    toJson(): JsonFormat {
        let result: JsonFormat = {
            stem: this.stem,
            en: this.en,
            i: this.inflection.id,
            t: InflectableWord.getJsonType(),
            f: this.wordForm
        }

        let derivationJson = this.getDerivationJson()

        if (derivationJson) {
            result.d = derivationJson
        }

        if (this.classifier) {
            result.cl = this.classifier
        }

        if (this.mask) {
            result.mask = this.getMaskId()
        }

        if (!this.studied) {
            result.unstudied = true
        }

        return result
    }

    getMaskId() {
        let posMasks = MASKS[this.inflection.wordForm.pos]

        let maskId = Object.keys(posMasks).find((key) => {
            return posMasks[key] === this.mask
        } )

        if (!maskId) {
            console.warn('Could not find the mask ' + this.mask + ' for ' + this.getId() + ' in the lists of masks.')
        }

        return maskId
    }

    getWordFact() {
        return this
    }

    toText() {
        return this.getDefaultInflection().toText()
    }
}