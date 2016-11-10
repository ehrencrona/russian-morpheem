
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

    return getLastSeenFactIds().map(id => corpus.facts.get(id)).filter(f => !!f)
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

    factIds.push(factId)

    localStorage.setItem(KEY, JSON.stringify(factIds))
}