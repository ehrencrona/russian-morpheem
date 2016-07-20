
import Corpus from '../shared/Corpus'

import readCorpus from './CorpusReader'
import { getCorpusDir } from './CorpusReader'

import writeSentenceFile from '../backend/SentenceFileWriter'
import writeInflectionFile from '../backend/inflection/InflectionFileWriter'
import writeFactFile from '../backend/FactFileWriter'
import writePhraseFile from '../backend/PhraseFileWriter'

import { notifyAdd } from './notifySlack'

let lastSave

export let storeSuccess = true

export default function listenForChanges(corpus: Corpus) {    

    function delay(func: () => void) {
        let pending: boolean

        return () => {
            if (pending) {
                return
            }

            setTimeout(() => {
                pending = false
                try {
                    func()
                }
                catch (e) {
                    console.error(e.stack)
                }
            }, 15000)

            pending = true
        }
    }

    function handleWriteError(e) {
        console.error(e.stack)
        storeSuccess = false
    }

    function handleWriteSuccess() {
        storeSuccess = true
    }

    function save(saveOperation: () => Promise<any>) {
        return delay(() => {
            lastSave = new Date().getTime()

            saveOperation()
            .then(handleWriteSuccess)
            .catch(handleWriteError)
        })
    }

    let saveSentences = 
        save(() => writeSentenceFile(corpusDir + '/sentences.txt', corpus.sentences, corpus.words))

    let saveFacts = 
        save(() => writeFactFile(corpusDir + '/facts.txt', corpus.facts))

    let saveInflections = 
        save(() => writeInflectionFile(corpusDir + '/inflections.txt', corpus.inflections, lang))

    let savePhrases = 
        save(() => writePhraseFile(corpusDir + '/phrases.txt', corpus.phrases))
        
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
    corpus.facts.onRemove = saveFacts
    corpus.facts.onTag = saveFacts
    corpus.facts.onUntag = saveFacts
    corpus.inflections.onAdd = saveInflections
    corpus.inflections.onRemove = saveInflections
    corpus.phrases.onChange = savePhrases

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