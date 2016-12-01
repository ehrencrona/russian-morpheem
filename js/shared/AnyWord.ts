import { WordCoordinates } from './inflection/WordForm';

import Fact from './fact/Fact'
import Translatable from './Translatable'
import WordForm from './inflection/WordForm'

/**
 * Rename to Word
 */
interface AnyWord extends Translatable {

    wordForm: WordForm
    studied: boolean

    getIdWithoutClassifier(): string
    getId(): string

    hasMyStem(word: AnyWord)

    getWordFact(): Fact

    getDictionaryFormOfTranslation(translation: string, form?: string): string
    getAllTranslations(): string[]
    getTranslationCount(): number

    setWordForm(wordForm: WordForm)

    getDerivedWords(derivation: string): AnyWord[]

    addDerivedWords(derivation: string, ...derived: AnyWord[])
    removeDerivedWords(derivation: string, ...derived: AnyWord[])

    isPunctuation(): boolean
}

export default AnyWord