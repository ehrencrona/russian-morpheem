import Facts from '../shared/Facts';
import Words from '../shared/Words';
import Sentence from '../shared/Sentence';
import Inflections from '../shared/Inflections';

export default class Corpus {
    constructor(
        public inflections: Inflections, public words: Words, 
        public sentences: Sentence[], public facts: Facts) {
        this.inflections = inflections
        this.words = words
        this.sentences = sentences
        this.facts = facts
    }
    
    toJson() {
        return {
            sentences: this.sentences.map((sentence) => sentence.toJson()),
            inflections: this.inflections.toJson(),
            facts: this.facts.toJson(),
            words: this.words.toJson()
        }
    }
}