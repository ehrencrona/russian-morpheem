
import Word from './Word'
import InflectableWord from './InflectableWord'
import Translatable from './Translatable'

interface AnyWord extends Translatable {

    studied: boolean
    pos: string

    getIdWithoutClassifier(): string
    getId(): string

}

export default AnyWord