import { toASCII } from 'punycode';

import readCorpus from '../CorpusReader'
import writeSentenceFile from '../SentenceFileWriter'

import InflectionFact from '../../shared/inflection/InflectionFact'
import InflectedWord from '../../shared/InflectedWord'
import AnyWord from '../../shared/AnyWord'

import writeFactFile from '../FactFileWriter'
import { getCorpusDir } from '../CorpusReader'

import InflectableWord from '../../shared/InflectableWord'
import Phrase from '../../shared/phrase/Phrase'

import { ENGLISH_FORMS_BY_POS } from '../../shared/inflection/InflectionForms'
import { Negation, PartOfSpeech } from '../../shared/inflection/Dimensions';
import MASKS from '../../shared/Masks'
import Word from '../../shared/Word'

const MASK_REPLACE = {
    'allbutadvandcomp': 'allbutcomp',
    'allbutplandadv': 'allbutpl'
}

readCorpus('ru', false)
.then((corpus) => {
    console.log('Read corpus.')

    let adjectives = 
        corpus.facts.facts.filter(adjective => 
            adjective instanceof InflectableWord && adjective.wordForm.pos == PartOfSpeech.ADJECTIVE)

    let newIds = {}

    adjectives.forEach(adjective => {
        if (adjective instanceof InflectableWord && adjective.wordForm.pos == PartOfSpeech.ADJECTIVE) {

            let oldAdverb = adjective.inflect('adv')

            if (oldAdverb) {
                let wordString = oldAdverb.toText()
                
                console.log(oldAdverb.getId())

                let toIndex = corpus.facts.indexOf(adjective)

                if (adjective.getMaskId() == 'allbutadv') {
                    corpus.facts.remove(adjective)
                    corpus.words.removeInflectableWord(adjective)
                    toIndex--
                }

                let newAdjective

                if (MASK_REPLACE[adjective.getMaskId()]) {
                    corpus.facts.remove(adjective)
                    corpus.words.removeInflectableWord(adjective)

                    newAdjective = new InflectableWord(adjective.stem, adjective.inflection, adjective.classifier)

                    newAdjective.en = adjective.en
                    newAdjective.enCount = adjective.enCount

                    newAdjective.setMask(MASKS[MASK_REPLACE[adjective.getMaskId()]])

                    console.log(adjective.getId() + ' -> ' + newAdjective.getId())

                    newIds[adjective.getId()] = newAdjective.getId()

                    corpus.words.addInflectableWord(newAdjective)
                    corpus.facts.add(newAdjective)
                    corpus.facts.move(newAdjective, toIndex)
                }

                let adverb = new Word(wordString, adjective.classifier)

                if (newAdjective && adverb.getId() == newAdjective.getId()) {
                    console.log('ID collision: ' + adverb.toString())

                    adverb = new Word(wordString, (adjective.classifier || '') + 'adv')
                }

                adverb.wordForm.pos = PartOfSpeech.ADVERB

                adverb.wordForm.negation = wordString.substr(0, 2) == 'не' ? Negation.NEGATIVE : Negation.POSITIVE

                for (let i = 0; i < oldAdverb.enCount; i++) {
                    adverb.setEnglish(oldAdverb.getEnglish('', i))
                }

                corpus.words.addWord(adverb)
                corpus.facts.add(adverb)
                corpus.facts.move(adverb, toIndex+1)

                corpus.words.addDerivedWords(adjective, 'adv', adverb)
            }
        }
    })

    return writeFactFile(getCorpusDir('ru') + '/facts.txt', corpus.facts)
    .then(() => {
        corpus.sentences.sentences.forEach(sentence => {

            sentence.words = sentence.words.map(word => {
                let result: Word = word 

                if (word.wordForm.pos == PartOfSpeech.ADJECTIVE && word instanceof InflectedWord) {
                    if (word.form == 'adv') {
                        let adverb = word.word.getDerivedWords('adv')[0]

                        if (adverb) {
                            result = adverb as Word
                        }
                        else {
                            console.log('found no adverb for ' + word.toText())
                        }
                    }
                    else if (newIds[word.word.getId()]) {
                        let newWord = corpus.facts.get(newIds[word.word.getId()]) 
                        
                        if (newWord instanceof InflectableWord) {
                            result = newWord.inflect(word.form)
                        }
                        else {
                            throw new Error('new word ' + newWord.getId() + ' not inflectable')
                        }
                    }
                }
                

                return result
            })

        })

        return writeSentenceFile(getCorpusDir('ru') + '/sentences.txt', corpus.sentences, corpus.words)
    })
})
.then(() => {
    console.log('done')

    process.exit(0)
})
.catch (e => {
    console.log(e.stack)
})

    
