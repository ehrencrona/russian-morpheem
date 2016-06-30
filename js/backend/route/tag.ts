import * as express from 'express'

import Sentence from '../../shared/Sentence'
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

function handle(corpus: Corpus, method: (fact: Fact, tag: string) => void) {
    return (req: express.Request, res: express.Response) => {
        let fact = corpus.facts.get(req.params.id)

        if (!fact) {
            throw new Error('Unknown fact.')
        }
        
        let tag = req.params.tag
        
        if (!tag) {
            throw new Error('No tag.')
        }
        
        method.apply(corpus.facts, [ fact, tag ])

        res.status(200).send({ })
    }
}

export function tag(corpus: Corpus) {
    return handle(corpus, corpus.facts.tag)
}

export function untag(corpus: Corpus) {
    return handle(corpus, corpus.facts.untag)
}