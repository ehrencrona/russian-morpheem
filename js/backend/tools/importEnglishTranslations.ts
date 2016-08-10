
import readCorpus from '../CorpusReader'
import InflectionFact from '../../shared/inflection/InflectionFact'

import writeFactFile from '../FactFileWriter'
import { getCorpusDir } from '../CorpusReader'

import Word from '../../shared/Word'
import Masks from '../../shared/Masks'
import InflectableWord from '../../shared/InflectableWord'
import { ENGLISH_FORMS_BY_POS } from '../../shared/inflection/InflectionForms'

const CLASSES = 4

import { readFile } from 'fs';


let words = ['длинный','новый','старый','который','известный','французский','прошлый','ваш','второй','другой','домашний','первый','голубой','собственный','любой','великий','чей','некоторый','животный','международный','выходной','уставший','огромный','центральный','способный','запасной','любимый','который']

readCorpus('ru', false)
.then((corpus) => {
    console.log('Read corpus.')

    words.forEach((word) => {
        let fact = corpus.facts.get(word)

        if (fact instanceof InflectableWord) {

            if (fact.mask == Masks.adj.short) {
                fact.mask = Masks.adj.shortandadv
            }
            else if (fact.mask == Masks.adj.compandshort) {
                fact.mask = Masks.adj.nonstd
            }
            else if (fact.mask == Masks.adj.comp) {
                fact.mask = Masks.adj.nonstd
            }
            else if (fact.mask) {
                console.log(fact.getId())
            }
            else {
                fact.mask = Masks.adj.adv

            }

        }
    })

    console.log('done')

    writeFactFile('facts.txt', corpus.facts)
})
.catch((e) => console.log(e.stack))

