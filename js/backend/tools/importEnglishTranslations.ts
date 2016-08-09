
import readCorpus from '../CorpusReader'
import InflectionFact from '../../shared/inflection/InflectionFact'

import writeFactFile from '../FactFileWriter'
import { getCorpusDir } from '../CorpusReader'

import Word from '../../shared/Word'
import InflectableWord from '../../shared/InflectableWord'
import { ENGLISH_FORMS_BY_POS } from '../../shared/inflection/InflectionForms'

const CLASSES = 4

import { readFile } from 'fs';


let inflectionsByDictForm: { [dictForm: string] : { [form: string]: string }} = {}

readFile('data/morph_english.txt', 'utf8', function (err, body) {
    if (err) {
        throw new Error(err.message)
    }

    body.split('\n').forEach((line) => {

        let firstEls = line.split(/[ \t]+/g)

        let multi = line.split('#') 

        multi.forEach((line,index) => {

            if (index > 0) {
                line = firstEls[0] + '\t' + line
            }

            if (line.indexOf('GEN') >= 0) {
                return
            }

            let els = line.split(/[ \t]+/g)

            if (els.length < 3) {
                return
            }

            let inflection = els[0]
            let dictForm = els[1]

            let pos = els[2]
            let form = els[3]

            if (pos == 'Adv') {
                pos = 'A'
                form = 'adv'
            }

            if (!form) {
                form = ''
            }

            let forms = inflectionsByDictForm[dictForm]

            if (!forms) {
                forms = {}
                inflectionsByDictForm[dictForm] = forms
            }

            forms[form] = inflection
        })

    })

    console.log('read forms')

    readCorpus('ru', false)
    .then((corpus) => {
        console.log('Read corpus.')

        corpus.facts.facts.forEach((fact) => {
            if (fact instanceof Word || fact instanceof InflectableWord) {

                let forms = ENGLISH_FORMS_BY_POS[fact.pos]
                let dictForm = fact.getEnglish()

                if (forms && dictForm) {
                    if (dictForm.substr(0, 3) == 'to ') {
                        dictForm = dictForm.substr(3)

                        fact.setEnglish(dictForm)
                    }

                    forms.forEach((form) => {

                        if (!fact.getEnglish(form)) {

                            if (form == 'adv') {
                                let maybe = dictForm + 'ly'

                                if (inflectionsByDictForm[maybe]) {
                                    console.log(dictForm + ' in ' + form + ': ' + maybe)

                                    fact.setEnglish(maybe, form)
                                }                                
                            }
                            else {
                                let theirForm = FORM_MAPPING[form]

                                if (inflectionsByDictForm[dictForm]) {
                                    let en = inflectionsByDictForm[dictForm][theirForm]

                                    console.log(dictForm + ' in ' + form + ': ' + en)

                                    fact.setEnglish(en, form)
                                }
                            }

                        }

                    })
                }
            }
        })

        console.log('done')
    
        writeFactFile('facts.txt', corpus.facts)
    })
    .catch((e) => console.log(e.stack))
})

const POS_MAPPING = {

    adj: 'A',
    n: 'N',
    v: 'V'

}

const FORM_MAPPING = {
    adv: 'adv',
    '3': '3sg',
    past: 'PAST',
    super: 'SUPER',
    prog: 'PROG',
    comp: 'COMP',
    pl: '3pl',
}
