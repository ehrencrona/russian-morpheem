'use strict'

import Phrases from './Phrases'
import Phrase from './Phrase'

export default function phrasesToString(phrases: Phrases, lang: string) {
    return phrases.all().map((p) => 
        `${p.id}: "${p.description}" ${p.toString()}`).join('\n')
}