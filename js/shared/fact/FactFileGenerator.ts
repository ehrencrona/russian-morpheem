

import Word from '../Word'
import { EndingTransform } from '../Transforms'

import Fact from './Fact'
import Facts from './Facts'
import TagFact from '../TagFact'
import AbstractAnyWord from '../AbstractAnyWord'
import InflectableWord from '../InflectableWord'
import InflectionFact from '../inflection/InflectionFact'
import InflectionForm from '../inflection/InflectionForm'
import { WORD_FORMS, getDerivations } from '../inflection/WordForms'
import { POSES } from '../inflection/InflectionForms'
import Phrase from '../phrase/Phrase'

export function factToString(fact: Fact, facts: Facts) {
    let tags = facts.getTagsOfFact(fact).map((tag) => ', tag: ' + tag).join('')

    let nonDefaultEnglish = (word: Word | InflectableWord) => {
        let result = ''

        for (let form in word.en) {
            if (form && word.en[form]) {
                result += `, ${form}: ${word.en[form]}` 
            }
        }

        return result
    }

    if (fact instanceof AbstractAnyWord) {
        let forms = Object.keys(WORD_FORMS)
            .filter(id => fact.wordForm.matches(WORD_FORMS[id]))
            .map(id => WORD_FORMS[id])

        if (forms.length > 1) {
            // eliminate redundant forms
            forms = forms.filter(form => !forms.find(superSetForm => 
                form.id != superSetForm.id && form.matches(superSetForm)))
        }

        let formString = forms.map(form => ', form: ' + form.id).join('')

        let derivations = ''
        
        getDerivations(fact.wordForm)
            .forEach(derivation => {
                let words = fact.derivations[derivation.id] 

                if (words) {
                    words.forEach(word => {
                        derivations += ', derive:' + derivation.id + ':' + word.getId()
                    })
                }
            })

        if (fact instanceof InflectableWord) {
            let ending = fact.inflection.getEnding(fact.inflection.defaultForm)
            let suffix: string = fact.inflection.getSuffix(ending, fact.stem).suffix

            return fact.stem + '--' + '<'.repeat(ending.subtractFromStem) + suffix + 
                (fact.classifier ? `[${ fact.classifier }]` : '') + 
                ': ' + fact.getEnglish() +
                nonDefaultEnglish(fact) +
                ', inflect: ' + fact.inflection.getId() + tags +
                formString +
                derivations + 
                (fact.mask ? ', mask: ' + fact.getMaskId() : '')
        }
        else if (fact instanceof Word) {
            return fact.jp +
                (fact.classifier ? `[${ fact.classifier }]` : '') + ': ' + fact.getEnglish('') + 
                nonDefaultEnglish(fact) +
                formString +
                derivations + 
                tags
        }
    }
    else if (fact instanceof EndingTransform) {
        return 'transform: ' + fact.getId()
    }
    else if (fact instanceof Phrase) {
        return `phrase: ${fact.id}` + tags
    }
    else if (fact instanceof TagFact) {
        return `tag: ${fact.id}`
    }
    else if (fact instanceof InflectionForm || fact instanceof InflectionFact) {
        return 'grammar: ' + fact.getId() + tags
    }
    else if (!fact) {
        return ''
    }
    else {
        throw new Error('Unhandled fact type ' + fact.constructor.name + ' of ' + fact.getId())
    }
}

export default function factsToString(facts: Facts) {
    return facts.facts.map((fact) => factToString(fact, facts)).join('\n')
}
