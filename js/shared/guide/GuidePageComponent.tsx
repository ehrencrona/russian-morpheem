
import { Component, createElement } from 'react'

import { CASES, POSES } from '../inflection/InflectionForms'
import Corpus from '../Corpus'
import Fact from '../fact/Fact'
import Sentence from '../Sentence'
import AbstractAnyWord from '../AbstractAnyWord'

import capitalize from './fact/capitalize'

import { InflectionForm } from '../inflection/InflectionForms'

import Phrase from '../phrase/Phrase'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus
    fact: Fact
    children?: Element
}

export default function guidePageComponent(props: Props) {
    let description =  ''
    let title = ''

    let factoid = props.corpus.factoids.getFactoid(props.fact)

    if (factoid.name) {
        title = factoid.name
    }

    if (factoid.explanation) {
        description = factoid.explanation
        
        if (description.length > 100) {
            let i = description.indexOf('.', 60)

            if (i < 0) {
                i = description.length
            }
            else {
                i++
            }

            if (i > 140) {
                i = 140
            }

            description = description.substr(0, i)
        }
    }

    let fact = props.fact

    if (fact instanceof Phrase) {
        let phrase = fact

        if (!title) {
            title = phrase.getWords().map(w => w.toText()).join(' and ') 
                + ' with the '
                + phrase.getCases().map(c => CASES[c]).join(' and ')
                + ' e.g. '
                + phrase.description
                + ' ("' 
                + phrase.en 
                + '")'
        }
    }
    else if (fact instanceof InflectionForm) {
        if (!title) {
            title = 'The ' + capitalize(fact.name)

            if (fact.grammaticalCase) {
                title += ' Case in Russian Grammar'
            }
        }
    }
    else if (fact instanceof AbstractAnyWord) {
        if (!title) {
            let translations = []

            let translationIndex = 0
            let translation
            
            while (translation = fact.getEnglish('', translationIndex)) {
                translations.push(translation)
                translationIndex++
            }

            title =
                fact.toText() 
                + ' – Russian ' 
                + POSES[fact.pos] 
                + ' meaning '
                + translations.map(t => `"${t}"`).join(', ') 
        }
    }

    if (!description) {
        let index = props.corpus.sentences.getSentencesByFact(props.corpus.facts)

        let sentences = index[fact.getId()]

        if (sentences) {
            let shortest: Sentence

            sentences.easy.concat(sentences.ok).concat(sentences.hard).forEach(sentenceDifficulty => {
                let sentence = sentenceDifficulty.sentence
                
                if (!shortest) {
                    shortest = sentence
                }
                else if (shortest.words.length > sentence.words.length) {
                    shortest = sentence
                }
            })            

            description = 'Usage: ' + shortest.toString() + ' - ' + shortest.en()    
        }
    }
    
    if (!title) {
        title = props.fact.getId()
    }

    return <html>

        <head>
            <link rel="stylesheet" type="text/css" href="/stylesheets/study.css"/>

            <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700" rel="stylesheet"/>
            <link href="https://fonts.googleapis.com/css?family=Rubik:700,900" rel="stylesheet"/>

            <title>{ title }</title>
            <meta name="description" content={ description }/>

            <script dangerouslySetInnerHTML={ { __html: 
                "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){"
                + "(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),"
                + "m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)"
                + "})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');"
                + "ga('create', 'UA-56615416-5', 'auto');"
                + "ga('send', 'pageview');"
            } }/>
        </head>

        <body>
            { props.children }
        </body>
    </html>;
}