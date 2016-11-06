import * as express from 'express'

import FactComponent from '../../shared/guide/fact/FactComponent'
import GuidePageComponent from '../../shared/guide/GuidePageComponent'

import NaiveKnowledge from '../../shared/study/NaiveKnowledge'

import Corpus from '../../shared/Corpus'
import Grammars from '../../shared/Grammars'

import getGuideUrl from './getGuideUrl'

import { Component, createElement } from 'react'

import DOMServer = require('react-dom/server')

let React = { createElement: createElement }

export default function(corpus: Corpus) {
    let grammars = new Grammars(corpus.inflections)

    return (req: express.Request, res: express.Response) => {

        if (req.hostname == 'russian.morpheem.com') {
            res.header({ 'Cache-Control': 'public, max-age=300000' });
        }

        let factId = req.params.fact

        let fact = corpus.facts.get(factId)

        if (!fact) {
            // this is only to be able to reach forms that not in the facts
            fact = grammars.get(factId)
        }

        if (!fact) {
            return res.send(`Unknown fact ${ factId }.`).status(404)
        }

        let context
        
        if (req.query.word) {
            context = corpus.words.get(req.query.word)
        }

        let html = DOMServer.renderToString(
            <GuidePageComponent
                corpus={ corpus }
                fact={ fact }>
                <FactComponent
                    corpus={ corpus }
                    fact={ fact }
                    context={ context }
                    onClose={ () => {} }
                    factLinkComponent={ (props) => {
                        return <a href={ getGuideUrl(props.fact, props.context) }>{ props.children }</a> }
                    }
                    knowledge={ new NaiveKnowledge() }
                />
            </GuidePageComponent>)

        res.send(html).status(200);

    }
}