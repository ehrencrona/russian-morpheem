import { InflectionForm } from '../../shared/inflection/InflectionForm';
import * as express from 'express'

import FactComponent from '../../shared/guide/fact/FactComponent'
import GuidePageComponent from '../../shared/guide/GuidePageComponent'
import getGuideUrl from '../../shared/guide/getGuideUrl'

import NaiveKnowledge from '../../shared/study/NaiveKnowledge'

import Corpus from '../../shared/Corpus'
import Grammars from '../../shared/Grammars'
import Sentence from '../../shared/Sentence'
import InflectableWord from '../../shared/InflectableWord'
import InflectedWord from '../../shared/InflectedWord'
import InflectionFact from '../../shared/inflection/InflectionFact'

import { Component, createElement } from 'react'

import DOMServer = require('react-dom/server')

let React = { createElement: createElement }

export default function(corpus: Corpus) {
    let grammars = new Grammars(corpus.inflections)

    return (req: express.Request, res: express.Response) => {
        let factId = req.params.fact

        let fact = corpus.facts.get(factId)

        if (!fact) {
            // this is only to be able to reach forms that not in the facts
            fact = grammars.get(factId)
        }

        if (!fact) {
            return res.status(404).send(`Unknown fact ${ factId }.`)
        }

        let context: InflectedWord
        
        if (req.query.word) {
            let wordFact = corpus.facts.get(req.query.word)

            if (!wordFact) {
                wordFact = corpus.words.get(req.query.word)
            }

            if (wordFact instanceof InflectedWord) {
                wordFact = wordFact.getWordFact()
            }

            if (wordFact instanceof InflectableWord && fact instanceof InflectionFact) {
                context = wordFact.inflect(fact.form)
            }
        }

        if (req.hostname == 'russian.morpheem.com') {
            // we're warming the cloudflare cache three hours; time out a bit before that.
            // however, for the form pages (context) that we are not warming, let them be
            // cached for a very long time. 
            res.header({ 'Cache-Control': 'public, max-age=' + 10700 * (context ? 500 : 1) });
        }

        let canonical = getGuideUrl(fact, context)

        if (req.url != canonical && decodeURI(req.url) != decodeURI(canonical)) {
            console.warn(`Non-canonical URL ${ decodeURI(req.url) }. Using ${ decodeURI(canonical) } instead.`)

            res.redirect(301, canonical)

            return
        }

        let html = DOMServer.renderToString(
            <GuidePageComponent
                corpus={ corpus }
                fact={ fact }
                context={ context }
                bodyClass='guide'>
                <div className='guideContainer'>
                    <FactComponent
                        corpus={ corpus }
                        fact={ fact }
                        context={ context }
                        factLinkComponent={ (props) => {
                            if (!props.fact) {
                                return null
                            }

                            return <a 
                                key={ props.fact.getId() }
                                rel={ props.fact instanceof Sentence || props.fact instanceof InflectionFact ? 'nofollow' : '' }
                                href={ getGuideUrl(props.fact, props.context) }>{ props.children }</a> }
                        }
                        knowledge={ new NaiveKnowledge() }
                    />
                </div>
            </GuidePageComponent>
        )

        res.send(html).status(200);

    }
}