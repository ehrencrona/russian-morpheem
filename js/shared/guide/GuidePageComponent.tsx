import getGuideUrl from './getGuideUrl';
import { NamedWordForm } from '../inflection/WordForm';

import { Component, createElement } from 'react'

import Corpus from '../Corpus'
import Fact from '../fact/Fact'
import Sentence from '../Sentence'
import AbstractAnyWord from '../AbstractAnyWord'

import capitalize from './fact/capitalize'

import { PartOfSpeech as PoS, Aspect,Reflexivity } from '../inflection/Dimensions'
import { CASES, LONG_POS_NAMES, FORMS } from '../inflection/InflectionForms'
import InflectionForm from '../inflection/InflectionForm'
import InflectionFact from '../inflection/InflectionFact'
import InflectedWord from '../InflectedWord'
import getPhraseSeoText from './fact/getPhraseSeoText'
import getExamplesUsingInflection from './fact/getExamplesUsingInflection'
import NaiveKnowledge from '../study/NaiveKnowledge'


import Phrase from '../phrase/Phrase'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus
    fact: Fact
    context?: InflectedWord
    children?: Element
    bodyClass?: string
}

export default function guidePageComponent(props: Props) {
    let description =  ''
    let title = ''

    let factoid 
    
    if (props.fact) {
        factoid = props.corpus.factoids.getFactoid(props.fact)
    }
    else {
        factoid = {
            explanation: '',
            relations: []
        }
    }

    if (factoid.name) {
        title = factoid.name
    }

    if (factoid.description) {
        description = factoid.description
    }
    else if (factoid.explanation) {
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
            let seoText = getPhraseSeoText(phrase)

            if (seoText) {
                title = seoText + ' ('
                    + phrase.description
                    + ' – ' 
                    + phrase.en 
                    + ') in Russian'
            }
            else {
                title = phrase.description
                    + ' ("' + phrase.en + '") in Russian'
            }
        }
    }
    else if (fact instanceof InflectionFact) {
        let form = FORMS[fact.form]

        if (!title && props.context) {
            let inflected = props.context.word

            title = 'The ' + form.name 
                + ' of the Russian ' 
                + inflected.toText() 

            description = 'The ' + form.name 
                + ' of the Russian ' + LONG_POS_NAMES[props.context.wordForm.pos] + ' ' 
                + inflected.toText() + ' ("' + inflected.getEnglish() + '") is ' + props.context.toText() + '.'
        }
        else {
            title = 'Forming the ' 
                + form.name 
                + ' of Russian ' + LONG_POS_NAMES[fact.inflection.wordForm.pos] + 's' 
                + ' using -' + fact.inflection.getEnding([fact.form]).suffix

            description = 'Some ' + LONG_POS_NAMES[fact.inflection.wordForm.pos] + 's use the ending -' 
                + fact.inflection.getEnding([fact.form]).suffix + ' to form the ' 
                + form.name + ' form in Russian, for example ' + 
                getExamplesUsingInflection(fact.form, fact.inflection, props.corpus, 
                    new NaiveKnowledge(), null, 2).map(w => w.toText()).join(' and ') + '.' 
        }
    }
    else if (fact instanceof NamedWordForm) {
        if (!title) {
            title = 'Russian ' + fact.name
        }
    }
    else if (fact instanceof InflectionForm) {
        if (!title) {
            if (fact.grammaticalCase && fact.name.indexOf(' ') < 0) {
                title += 'The ' + capitalize(fact.name) + ' Case in Russian Grammar'
            }
            else {
                 title += 'The ' + fact.name + ' form in Russian'
            }
        }
    }
    else if (fact instanceof AbstractAnyWord) {
        let translations = []

        let translationIndex = 0
        let translation
        
        for (let translationIndex = 0; translationIndex < fact.enCount; translationIndex++) {
            translations.push(fact.getEnglish((fact.wordForm.pos == PoS.VERB ? 'inf' : '')))
        }

        if (!title) {
            if (fact.wordForm.pos == PoS.VERB) {
                title = `${fact.toText()} – ` 
                    + translations.map(t => `"${t}"`).join(', ')
                    + ` – conjugation and meaning`
            }  
            else if (fact.wordForm.pos == PoS.PREPOSITION) {
                title = 'The Russian preposition ' 
                    + fact.toText() 
                    + ' meaning ' 
                    + translations.map(t => `"${t}"`).join(', ') 
            }
            else {
                title = 'Meaning of ' 
                    + fact.toText() 
                    + ' in Russian: ' 
                    + translations.map(t => `"${t}"`).join(', ') 
            }
        }

        if (!description && fact.wordForm.pos == PoS.VERB) {
            let sentences = props.corpus.sentences.getSentencesByFact(props.corpus.facts)[fact.getWordFact().getId()]

            description = 
                `${fact.toText()} is a Russian `
                + (fact.wordForm.reflex == Reflexivity.REFLEXIVE ? 'reflexive ' : '')
                + (fact.wordForm.aspect == Aspect.PERFECTIVE ? 'perfective' : 'imperfective')
                + ` verb meaning "${ translations[0] }".`

            if (sentences) {
                description += ` Morpheem has ${sentences.count} examples of usage.`
            }
        }
    }

    if (fact && !description) {
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
    
    if (fact && !title) {
        title = fact.getId()
    }

    return <html>

        <head>
            <link rel="stylesheet" type="text/css" href="/stylesheets/guide.css"/>

            <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700" rel="stylesheet"/>
            <link href="https://fonts.googleapis.com/css?family=Rubik:300,700,900" rel="stylesheet"/>

            <link rel="icon" type="image/png" href="/img/favicon-192x192.png" sizes="192x192"/>
            <link rel="icon" type="image/png" href="/img/favicon-160x160.png" sizes="160x160"/>
            <link rel="icon" type="image/png" href="/img/favicon-96x96.png" sizes="96x96"/>
            <link rel="icon" type="image/png" href="/img/favicon-16x16.png" sizes="16x16"/>
            <link rel="icon" type="image/png" href="/img/favicon-32x32.png" sizes="32x32"/>

            <title>{ title }</title>

            <meta name="description" content={ description }/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>

            <script dangerouslySetInnerHTML={ { __html: 
                "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){"
                + "(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),"
                + "m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)"
                + "})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');"
                + "ga('create', 'UA-56615416-5', 'auto');"
                + "ga('send', 'pageview');"
            } }/>
            {
                fact?
                <script dangerouslySetInnerHTML={ { __html: 
                    ` var factId="${ fact.getId() }"`
                } } />
                :
                null
            }
            <script src="/js/app.js" defer></script>
        </head>

        <body className={ props.bodyClass }>
            <div id='logo'>
                <a href='/'>
                    <img src='/img/logo-orange.png'/>
                </a>
            </div>

            <div id="react-guide-search"></div>

            { props.children }

            <div id="disqus_thread"></div>
            <script dangerouslySetInnerHTML={ { __html:
                `var disqus_config = function () {
                    this.page.url = "${ getGuideUrl(fact) }"; 
                    this.page.identifier = "${ fact.getId() }";
                };
                (function() { // DON'T EDIT BELOW THIS LINE
                var d = document, s = d.createElement('script');
                s.src = '//morpheem.disqus.com/embed.js';
                s.setAttribute('data-timestamp', +new Date());
                (d.head || d.body).appendChild(s);
                })();` 
            } } />               
        </body>
    </html>
}