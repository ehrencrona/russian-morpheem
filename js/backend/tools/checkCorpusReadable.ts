/// <reference path="../../../typings/redis.d.ts"/>

import readCorpus from '../CorpusReader'

readCorpus('ru', false)
.then((corpus) => {
    console.log('Successfully read corpus.')

    process.exit(0)
})
.catch((e) => {
    console.error(e)

    console.error(e.stack)

    process.exit(1)
})
