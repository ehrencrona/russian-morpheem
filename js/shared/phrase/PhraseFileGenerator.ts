'use strict'

import Phrases from './Phrases'
import Phrase from './Phrase'

export default function phrasesToString(phrases: Phrases) {
    return phrases.all().map((phrase) =>
        phrase.patterns.map((pattern) => 
            `${phrase.id}: "${(phrase.description || '').replace(/"/g, '\'')}" "${(phrase.en || '').replace(/"/g, '\'')}" "${(pattern.en || '').replace(/"/g, '\'')}" ${pattern.toString()}`
        ).join('\n')
    ).join('\n')
}