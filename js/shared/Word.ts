import { Derivation } from './inflection/WordForms';

import Fact from './fact/Fact';
import Inflections from './inflection/Inflections'
import PUNCTUATION from './Punctuation'
import Words from './Words'
import AbstractAnyWord from './AbstractAnyWord'
import AnyWord from './AnyWord'
import { JsonFormat as AbstractJsonFormat } from './AbstractAnyWord'
import { WordCoordinates, WordForm } from './inflection/WordForm'

export interface JsonFormat extends AbstractJsonFormat {
    target: string
}

/**
 * Rename to UninflectedWord
 */
export default class Word extends AbstractAnyWord {
    constructor(public jp: string, classifier?: string) {
        super(classifier)

        this.en = { }
    }

    related(fact) {
        // unused for now

        return this
    }

    getWordFact(): Fact {
        let omitted = this.omitted

        if (omitted instanceof Word) {
            return omitted
        }
        else {
            return this
        }
    }

    toString() {
        return this.jp
    }
    
    toUnambiguousString(words: Words) {
        let disambiguation = this.getDisambiguation(words)

        return this.jp + (disambiguation ? 
            ' [' + disambiguation + ']' : '')
    }

    getDisambiguation(words: Words) {
        let homonyms = words.ambiguousForms[this.jp]

        if (homonyms) {
            let form

            homonyms = homonyms.filter((other) => other !== this)

            if (!homonyms.find((otherWord) =>  
                    otherWord.getWordFact() != otherWord ||
                    otherWord.getIdWithoutClassifier() != this.getIdWithoutClassifier())) {
                form = this.classifier
            }
            else {
                form = this.getEnglish()
            }

            return form
        }
    } 

    toText() {
        return this.jp
    }
    
    visitFacts(visitor) {
        if (!this.isPunctuation()) {
            visitor(this.getWordFact())
        }

        this.visitRequired(visitor)
    }

    static fromJson(json: JsonFormat, inflections: Inflections): Word {
        let result = new Word(json.target, json.cl)
        
        result.en = json.en

        result.calculateEnCount()

        if (json.unstudied) {
            result.studied = false
        }

        result.wordForm = new WordForm(json.f)

        return result
    }

    toJson(): JsonFormat {
        let result: JsonFormat = {
            target: this.jp,
            en: this.en,
            cl: this.classifier,
            t: this.getJsonType(),
            f: this.wordForm,
        }

        let derivationJson = this.getDerivationJson()

        if (derivationJson) {
            result.d = derivationJson
        }

        if (!this.studied) {
            result.unstudied = true
        }

        return result
    }

    isPunctuation() {
        return PUNCTUATION.indexOf(this.jp) >= 0 && this.jp != '-' 
    }

    hasMyStem(word: AnyWord): boolean {
        return word.getId() == this.getId()
    }

    getIdWithoutClassifier() {
        return this.jp
    }

    getId() {
        return this.jp 
            + (this.classifier ? '[' + this.classifier + ']' : '') 
            + (this.omitted ? '*' : '')
    }

    getJsonType() {
        return 'word'
    }
}
