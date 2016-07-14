import parsePhraseFile from '../shared/phrase/PhraseFileParser'
import phrasesToString from '../shared/phrase/PhraseFileGenerator'

import { expect } from 'chai';

import Word from '../shared/Word'
import Inflections from '../shared/inflection/Inflections'
import Inflection from '../shared/inflection/Inflection'
import Words from '../shared/Words'
import Phrase from '../shared/phrase/Phrase'
import InflectableWord from '../shared/InflectableWord'
import { parseEndings } from '../shared/inflection/InflectionsFileParser'

describe('Phrases', function() {
    var inflections = new Inflections()

    inflections.add(new Inflection('inflection', 'nom', null, 
        parseEndings('nom: a', 'fake').endings))

    let w1: Word, w3: InflectableWord

    w1 = new Word('в', 'loc')
    w3 = new InflectableWord('библиотек', inflections.inflections[0])

    let words = new Words()
    words.addInflectableWord(w3)
    words.addWord(w1)

    it('parses phrase files', function () {
        let phrases = parsePhraseFile('вloc, "в for location", в[loc]@ prep', words, inflections)
        let phrase = phrases.get('phraseId')

        expect(phrase).to.be.instanceOf(Phrase)
        expect(phrase.getId()).to.equal('вloc')
        expect(phrase.description).to.equal('в for location')
    })

    it('generates phrase files', function () {
        let fileStr = 'вloc, "в for location", в[loc]@ prep'
        let phrases = parsePhraseFile(fileStr, words, inflections)
        
        expect(phrasesToString(phrases)).to.equal(fileStr)
        let phrase = phrases.get('phraseId')

        expect(phrase).to.be.instanceOf(Phrase)
        expect(phrase.getId()).to.equal('вloc')
        expect(phrase.description).to.equal('в for location')
    })
})
