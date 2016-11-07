
import Word from './Word'
import Fact from './fact/Fact'
import InflectableWord from './InflectableWord'
import Translatable from './Translatable'

/**
 * Rename to Word
 */
interface AnyWord extends Translatable {

    studied: boolean
    pos: string

    getIdWithoutClassifier(): string
    getId(): string

    hasMyStem(word: AnyWord)

    getWordFact(): Fact

    getTranslationCount(): number
    
}

export default AnyWord