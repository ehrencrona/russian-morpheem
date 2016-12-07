import { FORMS } from '../inflection/InflectionForms';
import { WORD_FORMS } from '../inflection/WordForms';

import Fact from '../fact/Fact'
import Corpus from '../Corpus'

const KEY = 'lastGuideFacts'

function hasLocalStorage() {
    return typeof localStorage !== 'undefined'
}

export function getLastSeenFacts(corpus: Corpus): Fact[] {
    if (!hasLocalStorage()) {
        return
    }

    let ids = getLastSeenFactIds()

    if (ids.length < 9) {
        ids = ids.concat([ 'prepos', 'perf', 'reflex', 'adv', 'quest', 
            'time-phrase', 'location-phrase', 'dative', 'genitive' ])
    }

    return ids.map(id => corpus.facts.get(id) || WORD_FORMS[id] || FORMS[id]).filter(f => !!f)
}

function getLastSeenFactIds(): string[] {
    let json = localStorage.getItem(KEY);    

    let factIds: string[]

    if (json) {
        try {
            factIds = JSON.parse(json)
        }
        catch (e) {
            console.error(`lastFacts "${json}" corrupt.`)
        }
    }

    return factIds || []
}

export function sawFact(factId: string) {
    if (!hasLocalStorage()) {
        return
    }

    let factIds = getLastSeenFactIds().filter(f => f != factId)

    factIds = [ factId ].concat(factIds).slice(0, 18)

    localStorage.setItem(KEY, JSON.stringify(factIds))
}