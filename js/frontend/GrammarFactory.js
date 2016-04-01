var Grammar = require('../shared/Grammar')

module.exports = [
    function () {
        var grammarById = {}

        function addGrammar(id, explanation) {
            if (grammarById[id]) {
                throw new Error('Grammar fact "' + id  + '" already exists.')
            }

            grammarById[id] = new Grammar(id, explanation)
        }

        addGrammar('long', 'Adding a う (and sometimes other vowels) after a vowel sound means the vowel should be pronounced longer.')
        addGrammar('halfvowel', 'Adding a small よ, ゆ or や (yo, yu, ya) replaces the vowel (always an "i") of the previous syllable, e.g. きゃ　("ki" plus small "ya") is pronounced "kya"')
        addGrammar('smalltsu', 'Adding a small つ (tsu) means the next consonant should be pronounced as double.')
        addGrammar('onematopoeia', 'Many words in Japanese attempt to imitate perceptions through the way they sound. They are called onematopoeia.')
        // explain pronounciation of wo as grammar "wo"
        addGrammar('silent', 'Japanese "i" and "u" can be silent if they occur between two unvoiced consonants(k, s, sh, t, ch, h, f, p) or at the end of certain words.')

        addGrammar('htob', 'A syllable with an "h" sound turns into a "b" sound when two small dashes are added, e.g. は (ha) becomes ば (ba).')
        addGrammar('stoz', 'A syllable with an "s" sound turns into a "z" sound when two small dashes are added, e.g. さ (sa) becomes ざ (za). One exception し (shi) becomes じ (ji) instead. A Japanese person cannot say "zi".')
        addGrammar('htop', 'A syllable with an "h" sound turns into a "p" sound when a small circle is added, e.g. は (ha) becomes ぱ (pa).')
        addGrammar('ktog', 'A syllable with an "k" sound turns into a "g" sound when two small dashes are added, e.g. か (ka) becomes が (ga).')
        addGrammar('ttod', 'A syllable with an "t" sound turns into a "d" sound when two small dashes are added, e.g. た (ta) becomes だ (da).')

        return function grammar(id) {
            var result = grammarById[id]

            if (!result) {
                throw new Error('No grammar fact "' + id + '"')
            }

            return result
        }
    }
]
