"use strict";

import Word from './Word'
import UnstudiedWord from './UnstudiedWord'
import InflectedWord from './InflectedWord'
import Inflection from './Inflection'
import Inflections from './Inflections'


interface JsonFormat {
    stem: string,
    en: string,
    inflection: string,
    type: string,
    classifier?: string
}


export default class InflectableWord {
    inflectionByForm : { [s: string]: InflectedWord } = {}
    en: string

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

        if (!result) {
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
            visitor(this.inflect(form))
        }
    }

    getId() {
        let result = this.inflect(this.inflection.defaultForm).jp

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

    static fromJson(rawJson, inflections: Inflections): InflectableWord {
        let json = rawJson as JsonFormat

        let inflection = inflections.get(json.inflection)

        if (!inflection) {
            throw new Error('The inflection ' + json.inflection + ' does not exist.')
        }

        return new InflectableWord(
            json.stem, inflection, json.classifier)
            .setEnglish(json.en)
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

        return result
    }
}