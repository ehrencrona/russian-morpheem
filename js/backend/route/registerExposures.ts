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
            let unknown = exposuresToStore
                .filter((e) => e.knew == Knowledge.DIDNT_KNOW)
                .map((e) => e.fact)

            console.log(new Date() + ' ' + author.name 
                + (unknown.length ?
                    ' did not know ' + unknown.join(', ') :
                    ' knew everything'
                )
                + ' in sentence ' + exposuresToStore[0].sentence + '.')

            res.status(200).send({})
        })
        .catch((e) => {
            console.error(e.stack)
            res.status(500).send(e)
        })
    }
}