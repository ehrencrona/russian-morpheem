
import Word from './Word'
import Fact from './fact/Fact'
import InflectableWord from './InflectableWord'
import Translatable from './Translatable'

interface AnyWord extends Translatable {

    studied: boolean
    pos: string

    getIdWithoutClassifier(): string
    getId(): string

    getWordFact(): Fact

}

export default AnyWord