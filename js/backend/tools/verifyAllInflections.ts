/// <reference path="../../../typings/redis.d.ts"/>

var redis = require('node-redis')

import readCorpus from '../CorpusReader'
import InflectableWord from '../../shared/InflectableWord'
import InflectedWord from '../../shared/InflectedWord'
import NoSuchWordError from '../../shared/NoSuchWordError'
import { INFLECTION_FORMS } from '../../shared/inflection/InflectionForms'
import { InflectionInDatabase } from '../inflection/InflectionDatabase'
import getInflections from '../inflection/InflectionDatabase'

let client = redis.createClient()

client.on('error', function (err) {
    console.log('Error ' + err);
})

client.on('connect', function (err) {
    console.log('connected');
})

let unknowns = []

interface WrongForm {
    correct: string,
    actual: string,
    definedOn: string
}

interface FormStats {
    wrong: WrongForm[],
    right: string[]
}

let statsByForm: { [ inflectionAndForm : string ] : FormStats } = {}

let ignore = [
    'мороженое', 'я', 'интернет', 'болеть', 'человек', 'ребёнок', 'весь', 'год', 'мороза'
]

let ignoreByWord = {}

ignore.forEach((word) => ignoreByWord[word] = true)

readCorpus('ru', false)
.then((corpus) => {
    console.log('Read corpus.')

    let p = Promise.resolve()

    corpus.facts.facts.forEach((fact) => {
        if (fact instanceof InflectableWord) {
            let defaultForm = fact.getDefaultInflection().jp

            if (ignoreByWord[defaultForm]) {
                return
            }

            p = p.then(
                
                () => getInflections(defaultForm, client)
                
            )
            .then((correctInflections: InflectionInDatabase) => {

                fact.visitAllInflections((inflection: InflectedWord) => {

                    let correct = correctInflections.forms[inflection.form]

                    if (correct) {
                        let definedOn = inflection.word.inflection.getFact(inflection.form).inflection.id
                        let key = definedOn + ' ' + inflection.form

                        let stats: FormStats = statsByForm[key]
                         
                        if (!stats) {
                            stats = { 
                                right: [],
                                wrong: []
                            }

                            statsByForm[key] = stats
                        }

                        if (correct == inflection.toString()) {
                            stats.right.push(correct)
                        }
                        else {
                            stats.wrong.push({
                                correct: correct,
                                actual: inflection.toString(),
                                definedOn: definedOn
                            })
                        }
                    }

                })

            })
            .catch((e) => {
                if (!(e instanceof NoSuchWordError)) {
                    console.error(e)
                }
                else {
                    unknowns.push(defaultForm)
                }
            })

        }
    })

    return p
})
.then(() => {
    function dotdot(array: string[]) {
        if (array.length > 4) {
            return array.slice(0, 4).join(', ') + '...'
        }
        else {
            return array.join(', ')
        }
    }

    function wrongFormToString(wrongForm) {
        return wrongForm.correct + ' (became "' + wrongForm.actual + '")' 
    }

    Object.keys(statsByForm).sort().forEach((formKey) => {
        let stats = statsByForm[formKey]

        if (stats.wrong.length && stats.right.length) {
            console.log(formKey + ' was right for ' + dotdot(stats.right) + 
                ' but wrong for ' + dotdot(stats.wrong.map(wrongFormToString)))
        }
        else if (stats.wrong.length) {
            console.log(formKey + ' was always wrong: ' + dotdot(stats.wrong.map(wrongFormToString)))
        }
    })

    console.log('Unknown: ' + unknowns.join(', '))
    console.log('done')
})
.catch((e) => {
    console.error(e)
})
