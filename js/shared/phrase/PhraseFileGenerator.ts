'use strict'

import Phrases from './Phrases'
import Phrase from './Phrase'

export default function phrasesToString(phrases: Phrases) {
    return phrases.all().map((p) => 
        `${p.id}: "${p.description.replace(/"/g, '\'')}" ${p.toString()}`).join('\n')
}