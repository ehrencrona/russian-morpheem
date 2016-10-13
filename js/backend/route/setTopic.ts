import * as express from 'express'

import Corpus from '../../shared/Corpus'
import { Topic, SerializedTopic } from '../../shared/metadata/Topics'
import {  deserialize } from '../metadata/BackendTopics'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let topicId = req.params['id']

        if (!topicId) {
            throw new Error('No topic ID')
        }

        corpus.topics.setTopic(deserialize(req.body as SerializedTopic, corpus.facts))
            .then((events) => {
                res.status(200).send({ ok: true })
            })
            .catch(e => {
                res.status(500).send(e)
                console.error(e.stack)
            })
    }
}