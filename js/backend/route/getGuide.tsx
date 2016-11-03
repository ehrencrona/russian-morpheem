import * as express from 'express'

import FactComponent from '../../shared/guide/fact/FactComponent'
import GuidePageComponent from '../../shared/guide/GuidePageComponent'

import NaiveKnowledge from '../../shared/study/NaiveKnowledge'
import Corpus from '../../shared/Corpus'
import { Component, createElement } from 'react'

import DOMServer = require('react-dom/server')

let React = { createElement: createElement }

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {

        let fact = corpus.facts.get(req.params.fact)

        if (!fact) {
            return res.send(`Unknown fact ${ req.params.fact }.`).status(404)
        }

        let html = DOMServer.renderToString(
            <GuidePageComponent
                corpus={ corpus }
                fact={ fact }>
                <FactComponent
                    corpus={ corpus }
                    fact={ fact }
                    context={ null }
                    onClose={ () => {} }
                    factLinkComponent={ (props) => 
                        <a href={ `/guide/${props.fact.getId()}` }>{ props.children }</a> }
                    knowledge={ new NaiveKnowledge() }
                />
            </GuidePageComponent>)

        res.send(html).status(200);

    }
}