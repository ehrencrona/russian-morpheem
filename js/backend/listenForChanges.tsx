
import Corpus from '../shared/Corpus'

import readCorpus from './CorpusReader'
import { getCorpusDir } from './CorpusReader'

import writeSentenceFile from '../backend/SentenceFileWriter'
import writeInflectionsFile from '../backend/InflectionsFileWriter'
import writeFactFile from '../backend/FactFileWriter'

import { notifyAdd } from './notifySlack'

let lastSave

export default function listenForChanges(corpus: Corpus) {    

    function delay(func: () => void) {
        let pending: boolean
        return () => {
            if (pending) {
                return
            }

            setTimeout(() => {
                pending = false
                func()
            }, 15000)

            pending = true
        }
    }

    let saveSentences = delay(() => {
        lastSave = new Date().getTime()

        writeSentenceFile(corpusDir + '/sentences.txt', corpus.sentences, corpus.words)
        .catch((e) => console.error(e.stack))
    })

    let saveFacts = delay(() => {
        lastSave = new Date().getTime()

        writeFactFile(corpusDir + '/facts.txt', corpus.facts)
        .catch((e) => console.error(e.stack))
    })

    let saveInflections = delay(() => {
        lastSave = new Date().getTime()
        
        writeInflectionsFile(corpusDir + '/inflections.txt', corpus.inflections, lang)
        .catch((e) => console.error(e.stack))
    })

    let corpusDir = getCorpusDir(corpus.lang)
    let lang = corpus.lang

    corpus.sentences.onAdd = (sentence) => {
        if (process.env.ENV != 'dev') {
            setTimeout(() => {
                let editedSentence = corpus.sentences.get(sentence.id)
                
                if (editedSentence) {
                    notifyAdd(editedSentence)
                }
            }, 180000)
        }

        saveSentences()
    }
    
    corpus.sentences.onChange = saveSentences
    corpus.sentences.onDelete = saveSentences
    corpus.facts.onMove = saveFacts
    corpus.facts.onAdd = saveFacts
    corpus.facts.onTag = saveFacts
    corpus.facts.onUntag = saveFacts
    corpus.words.onChangeInflection = saveFacts
    corpus.inflections.onAdd = saveInflections

    corpus.onChangeOnDisk = () => {
        let t = new Date().getTime()
        
        if (lastSave && t - lastSave < 5000) {
            return
        }

        setTimeout(() => {            
            readCorpus(lang, false).then((newCorpus: Corpus) => {
                console.log(`Reloaded corpus ${lang}.`);

                corpus.clone(newCorpus)
            })
            .catch((e) => {
                console.log(e)
            })
        }, 200)
    }
}

