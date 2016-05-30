"use strict";

import Word from './Word'
import UnstudiedWord from './UnstudiedWord'
import InflectedWord from './InflectedWord'
import Inflection from './Inflection'
import Inflections from './Inflections'

export default class InflectableWord {
    inflectionByForm : { [s: string]: InflectedWord } = {}
    en: string

    constructor(public stem: string, public inflection: Inflection) {
        this.stem = stem
        this.inflection = inflection
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
            
            result = new InflectedWord(jp, form, this)
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
        return this.inflect(this.inflection.defaultForm).jp
    }

    static getJsonType() {
        return 'ib'
    }

    setEnglish(en) {
        this.en = en
        
        return this
    }

    static fromJson(json, inflections: Inflections): InflectableWord {
        let inflection = inflections.get(json.inflection)

        if (!inflection) {
            throw new Error('The inflection ' + json.inflection + ' does not exist.')
        }

        return new InflectableWord(
            json.stem, inflection)
            .setEnglish(json.en)
    }
    
    toString() {
        return this.getId() + ' (' + this.inflection.getId() + ')'
    }

    toJson() {
        return {
            stem: this.stem,
            en: this.en,
            inflection: this.inflection.id,
            type: InflectableWord.getJsonType()
        }
    }
}