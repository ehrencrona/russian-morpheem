import * as express from 'express'

import exposures from '../../backend/study/BackendExposures'
import Exposure from '../../shared/study/Exposure'
import { Knowledge } from '../../shared/study/Exposure'

import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let author = getAuthor(req)
        let authorId = author.numericalId

        let exposuresToStore = req.body as Exposure[]

        exposuresToStore.forEach((exposure) => exposure.user = authorId)

        exposures.registerExposures(exposuresToStore).then(() => {
            console.log(author.name + ' did not know ' +
                exposuresToStore.filter((e) => e.knew == Knowledge.DIDNT_KNOW).map((e) => e.fact).join(', ') +
                ' in sentence ' + exposuresToStore[0].sentence + '.')

            res.status(200).send({})
        })
        .catch((e) => {
            console.error(e.stack)
            res.status(500).send(e)
        })
    }
}