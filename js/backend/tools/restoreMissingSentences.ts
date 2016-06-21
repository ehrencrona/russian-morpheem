

import { getEventsForSentence } from '../metadata/Metadata'
import readCorpus from '../CorpusReader'

readCorpus('ru', false)
.then((corpus) => {

console.log('corpus', corpus.sentences.sentences.length)
    let p = Promise.resolve()

    for (let i = 0; i < 3605; i++) {

        p = p.then(() => getEventsForSentence(i))
        .then((events) => {
            let lastEvent = events.reverse().find((event) => event.event != 'comment')

            if (lastEvent) {
                if (lastEvent.date.getTime() < new Date().getTime() - 18 * 60 * 60 * 1000) {
                    return
                }
                
                let lastText = events[events.length-1].text

                if (!corpus.sentences.sentenceById[i]) {
                //    console.log(i + ': ' + lastText.toLowerCase())
                }
                else if (lastText !== corpus.sentences.sentenceById[i].toString() &&
                    lastText !== corpus.sentences.sentenceById[i].toString()) {
                    console.log(i, lastText, ' <-> ', corpus.sentences.sentenceById[i].toString())
                }
            }
        })
        .catch((e) => {
            console.error(e.stack)
        })
        
    } 

    p.then(() => console.log('done'))
})
