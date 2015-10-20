(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var SentenceFileParser = require('../shared/SentenceFileParser')
var FactFileParser = require('../shared/FactFileParser')

function failedLoading(err) {
    // no idea what else we could do here. retry?
    throw err
}

module.exports = [
    '$http', 'grammar', '$q',
    function ($http, grammar, $q) {
        var factPromise = $http.get('/corpus/hiragana/facts.txt', { timeout: 4000 })
            .then(
            function (data) {
                console.log('Loaded facts.')

                return FactFileParser(data.data, grammar)
            },
            failedLoading
        )

        return $q.all([
            factPromise,
            $http.get('/corpus/hiragana/words.txt', { timeout: 4000 })
        ]).then(function(res) {
            console.log('Loaded sentences.')

            let facts = res[0]
            let sentenceData = res[1].data

            var factsById = {}

            for (let fact of facts) factsById[fact.toString()] = fact

            return {
                sentences: SentenceFileParser(sentenceData, factsById, grammar),
                facts: facts
            }
        },
            failedLoading)
    }
]

},{"../shared/FactFileParser":7,"../shared/SentenceFileParser":16}],2:[function(require,module,exports){
var Grammar = require('../shared/Grammar')

module.exports = [
    function () {
        var grammarById = {}

        function addGrammar(id, desc) {
            if (grammarById[id]) {
                throw new Error('Grammar fact "' + id  + '" already exists.')
            }

            grammarById[id] = new Grammar(id, desc)
        }

        addGrammar('long')
        addGrammar('halfvowel')
        addGrammar('smalltsu')
        addGrammar('onematopoeia')
        // explain pronounciation of wo as grammar "wo"
        addGrammar('silent', 'Japanese "i" and "u" are only silent if they occur between two unvoiced consonants(k, s, sh, t, ch, h, f, p) or at the end of a few certain words.')

        addGrammar('htob')
        addGrammar('stoz', 'note that shi becomes ji, not zi')
        addGrammar('htop')
        addGrammar('ktog')
        addGrammar('ttod')

        return function grammar(id) {
            var result = grammarById[id]

            if (!result) {
                throw new Error('No grammar fact "' + id + '"')
            }

            return result
        }
    }
]

},{"../shared/Grammar":10}],3:[function(require,module,exports){
"use strict";

var SentenceModel = require('./SentenceModel')
var nextSentenceCalculator = require('../shared/NextSentenceCalculator')

class NextSentenceModel {
    constructor(factKnowledge, sentenceKnowledge, sentences, factOrder) {
        this.factKnowledge = factKnowledge
        this.sentenceKnowledge = sentenceKnowledge
        this.sentences = sentences
        this.factOrder = factOrder
    }

    /**
     * Returns a SentenceModel
     */
    nextSentence(knownFacts, unknownFacts, lastSentence, time) {
        for (let fact of knownFacts) {
            this.factKnowledge.knew(fact, time)
        }

        for (let fact of knownFacts) {
            this.factKnowledge.didntKnow(fact, time)
        }

        if (lastSentence) {
            this.sentenceKnowledge.knew(lastSentence, time)
        }

        var sentence = nextSentenceCalculator.calculateNextSentence(
            this.sentences, this.sentenceKnowledge, this.factKnowledge, this.factOrder, time)[0].sentence

        console.log('next sentence', sentence)

        return new SentenceModel(sentence, this.factKnowledge, time)
    }
}

module.exports = NextSentenceModel
},{"../shared/NextSentenceCalculator":14,"./SentenceModel":4}],4:[function(require,module,exports){
"use strict";

var _ = require('underscore')

var Sentence = require('../shared/Sentence')
var Knowledge = require('../shared/Knowledge')
var typecheck = require('../shared/typecheck')
var visitUniqueFacts = require('../shared/visitUniqueFacts')

class SentenceModel {

    constructor(sentence, factKnowledge, time) {
        typecheck(arguments, Sentence, Knowledge)

        this.sentence = sentence
        this.factKnowledge = factKnowledge
        this.time = time

        this.meaning = sentence.english
        this.explanation = sentence.english

        this.words = sentence.words

        var factsById = {}
        this.factsById = factsById

        this.newFacts = [
            'な'
        ]

    }

    /**
     * Visits objects { fact: <Fact>, knowledge: <float> }
     * @param word Optional. If not set, iterates through all facts
     */
    visitKnownFacts(visitor, word) {
        // TODO: facts by word
        visitUniqueFacts(this.sentence, (fact) => visitor({
            fact: fact,
            knowledge: this.factKnowledge.getKnowledge(fact, this.time)
        }))
    }

}

module.exports = SentenceModel
},{"../shared/Knowledge":13,"../shared/Sentence":15,"../shared/typecheck":21,"../shared/visitUniqueFacts":22,"underscore":23}],5:[function(require,module,exports){
"use strict";

var SentenceModel = require('./SentenceModel')
var NextSentenceModel = require('./NextSentenceModel')
var Sentence = require('../shared/Sentence')
var Word = require('../shared/Word')
var Knowledge = require('../shared/Knowledge')

module.exports =
    [ '$scope', '_', 'corpus',
        function($scope, _, corpusPromise) {
            function getKnownFactsByKnowledge(sentence) {
                var knownFactsByKnowledge = []

                sentence.visitKnownFacts((knownFact) => {
                    knownFactsByKnowledge.push(knownFact)
                })

                knownFactsByKnowledge = _.sortBy(knownFactsByKnowledge, (knownFact) => -knownFact.knowledge )

                return knownFactsByKnowledge
            }

            corpusPromise.then((corpus) => {
                $scope.sentence =
                    new NextSentenceModel(new Knowledge(), new Knowledge(), corpus.sentences, corpus.facts).
                        nextSentence([], [], null, 0)

                $scope.reveal = () => {
                    $scope.revealed = true
                }

                $scope.knownFactsByKnowledge = getKnownFactsByKnowledge($scope.sentence)
            })
        }]


},{"../shared/Knowledge":13,"../shared/Sentence":15,"../shared/Word":19,"./NextSentenceModel":3,"./SentenceModel":4}],6:[function(require,module,exports){
"use strict"

var module = angular.module('morpheemJapanese',
    [
        'ngAnimate', 'ngRoute'
    ])

module
    .factory('_', function() {
        return window._ // assumes underscore has already been loaded on the page
    })
    .config(['$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {
            $locationProvider.hashPrefix('!')

            $routeProvider.
                when('/study-hiragana', {
                    templateUrl: 'study-hiragana.html',
                    controller: 'StudyHiraganaController'
                })
        }])
    .factory('corpus', require('./CorpusFactory'))
    .factory('grammar', require('./GrammarFactory'))
    .controller('StudyHiraganaController',
        require('./StudyHiraganaController'))


},{"./CorpusFactory":1,"./GrammarFactory":2,"./StudyHiraganaController":5}],7:[function(require,module,exports){
"use strict";

/**
 * Parses a list of facts (words and grammar) that defines the order in which the facts should be learned.
 * The file also serves to define the English translation of words. Resolves to an array consisting of Words,
 * Particles and Grammar.
 *
 * Each line in the file has the following format:
 *
 * 出る: go out, past: went out, inflect:ruverb
 *
 * This defines "出る" with its translation of "go out", specifies the English past and how the word is infected.
 * "ruverb" is used to look up an inflecting function that generates past, negative form etc.
 *
 * See facts.txt for an example.
 */

var Word = require('./Word')
var UnstudiedWord = require('./UnstudiedWord')
var Inflections = require('./Inflections')
var typecheck = require('./typecheck')
var _ = require('underscore')

module.exports = (data, grammar) => {
    typecheck([data, grammar], 'string', 'function')

    var facts = []
    var factsById = {}

    function foundFact(fact) {
        // there are also particles being read, which are not facts and don't have a getId
        if (fact.getId) {
            factsById[fact.getId()] = fact
        }

        facts.push(fact)
    }

    function parseWordAndClassifier(jpWord) {
        let classifier
        let m = jpWord.match(/(.*)\[(.*)\]/)

        var text

        if (m) {
            text = m[1]
            classifier = m[2]
        }
        else {
            text = jpWord
        }

        return {classifier: classifier, word: text}
    }

    function parseLeftSideOfDefinition(leftSide) {
        let elements = _.map(leftSide.split(','), (s) => s.trim())

        let Class = (leftSide.indexOf('unstudied') > 0 ? UnstudiedWord : Word)

        var parseResult = parseWordAndClassifier(elements[0])

        return new Class(parseResult.word, parseResult.classifier)
    }

    function parseRightSideOfDefinition(rightSide, word) {
        let elements = _.map(rightSide.split(','), (s) => s.trim())

        for (let element of elements) {
            let split = _.map(element.split(':'), (s) => s.trim())
            let tag
            let text

            if (!split[1]) {
                // form undefined means this is the english translation
                text = split[0]
            }
            else {
                tag = split[0]
                text = split[1]
            }

            if (tag == 'inflect') {
                if (!Inflections[text]) {
                    throw new Error('Unknown inflection "' + text + '"')
                }

                for (let inflection of Inflections[text](word, grammar)) {
                    foundFact(inflection)
                }
            }
            else if (tag == 'requires') {
                var requiredWord = factsById[text]

                if (!requiredWord) {
                    throw new Error('Unknown required word "' + text + '" in "' + rightSide + '"')
                }

                word.requiresFact(requiredWord)
            }
            else if (tag == 'grammar') {
                word.requiresFact(grammar(text))
            }
            else {
                word.setEnglish(text, tag)
            }
        }
    }

    for (let line of data.split('\n')) {
        if (!line || line.substr(0, 2) == '//') {
            continue
        }

        let i = line.indexOf(':')

        if (i < 0) {
            new Error('Every line should start with the Japanese word followed by colon. "' + line + '" does not.')
        }

        let leftSide = line.substr(0, i)
        let rightSide = line.substr(i + 1)

        if (leftSide == 'grammar') {
            foundFact(grammar(rightSide.trim()))
        }
        else {
            let word = parseLeftSideOfDefinition(leftSide)

            parseRightSideOfDefinition(rightSide, word, grammar, factsById)

            foundFact(word)
        }
    }

    return facts
}

},{"./Inflections":12,"./UnstudiedWord":18,"./Word":19,"./typecheck":21,"underscore":23}],8:[function(require,module,exports){
"use strict";

var _ = require('underscore')
var typecheck = require('./typecheck')

var Word = require('./Word')

var MAX_SIMULTANEOUS_STUDY = 10
var EASY_REPETITIONS = 5
var HARD_REPETITIONS = 10

function cloneArray(sentences) {
    return sentences.slice(0, sentences.length);
}

var StudyResult = Class.extend({
    init: function() {
        this.unknownById = {}
        this.studyingById = {}
        this.knownById = {}
    }
})

var Knowledge = Class.extend({
    init: function() {
        this.studyingById = {}
        this.knownById = {}
        this.learningSince = {}

        this.inadequateRepetition = {}
    },

    learnedFact: function (factId) {
        delete this.studyingById[factId]

        this.knownById[factId] = 1
    },

    firstSawFact: function (factId) {
        this.studyingById[factId] = 1
    },

    repeatedFact: function (factId) {
        this.studyingById[factId]++
    },

    learn: function(studyResult, factIndex) {
        _.forEach(_.keys(studyResult.knownById), (factId) => {
            var reps = this.knownById[factId]++

            if (isNaN(reps)) {
                throw new Error('Did not know known ID ' + factId)
            }
        })

        _.forEach(_.values(studyResult.unknownById).concat(_.values(studyResult.studyingById)), (fact) => {
            var unknownId = fact.getId()
            var alreadyStudied = this.studyingById[unknownId]

            if (alreadyStudied >= (fact.isHardFact && fact.isHardFact() ? HARD_REPETITIONS : EASY_REPETITIONS) - 1) {
                this.learnedFact(unknownId)
            }
            else if (alreadyStudied > 0) {
                this.repeatedFact(unknownId)
            }
            else {
                this.firstSawFact(unknownId, factIndex)
            }
        })
    },

    seekToLearn: function(fact, factIndex) {
        this.studyingById[fact] = 0
        this.learningSince[fact.getId()] = factIndex
    },

    evaluateFactSet: function(factSet) {
        var knowledge = this

        var result = new StudyResult()

        factSet.visitFacts(function(fact) {
            var id = fact.getId()

            if (knowledge.studyingById[id] !== undefined) {
                result.studyingById[id] = fact
            }
            else if (knowledge.knownById[id]) {
                result.knownById[id] = fact
            }
            else {
                result.unknownById[id] = fact
            }
        })

        return result
    },

    checkAdequateRepetition: function(factIndex) {
        if (factIndex < MAX_SIMULTANEOUS_STUDY * 3 / 2) {
            return
        }

        var SCHEDULE = [ 0, 1, 2, 3, 3, 4, 4, 5, 5 ]

        for (let factId of _.keys(this.studyingById)) {
            var firstSeen = this.learningSince[factId]

            if (firstSeen == undefined) {
                console.log(this.learningSince)

                throw new Error('Had never seen ' + factId)
            }

            var age = factIndex - firstSeen
            var reps = this.studyingById[factId]

            if (!this.inadequateRepetition[factId] && age < SCHEDULE.length && reps < SCHEDULE[age]) {
                console.log('Only', reps, 'repetitions for', factId + '. Expected ' + SCHEDULE[age])

                throw Error()

                this.inadequateRepetition[factId] = true
            }
        }
    }
})

var FactOrder = Class.extend({
    init: function(facts) {
        var seen = {}

        var factIndexById = {}

        _.forEach(facts, function(fact, index) {
            if (!fact.getId) {
                throw new Error(fact + ' is not a fact. Is it a particle? Use grammar instead.')
            }

            if (factIndexById[fact.getId()] !== undefined) {
                throw new Error('Double fact ' + fact)
            }

            factIndexById[fact.getId()] = index
        })

        this.factIndexById = factIndexById
        this.facts = facts
    },

    discoverMore: function(sentences) {

    },

    evaluateConsistency: function(sentences) {
        var t = new Date().getTime()

        sentences = cloneArray(sentences)

        var knowledge = new Knowledge()

        var sentencesByFactIndex = []

        for (var sentenceIndex = 0; sentenceIndex < sentences.length; sentenceIndex++) {
            var sentence = sentences[sentenceIndex]

            var highestFactIndex = -1

            let ignore

            sentence.visitFacts((fact) => {
                var factIndex = this.factIndexById[fact.getId()]

                if (factIndex == null) {
                    console.log('Fact ' + fact.getId() + ' not in fact order. Ignoring ' + sentence)

                    ignore = true
                }

                if (factIndex > highestFactIndex) {
                    highestFactIndex = factIndex
                }
            })

            if (ignore) {
                continue
            }

            if (highestFactIndex == -1) {
                console.log('Can\'t study sentence "' + sentence + '"')
            }
            else if (sentencesByFactIndex[highestFactIndex]) {
                sentencesByFactIndex[highestFactIndex].push(sentence)
            }
            else {
                sentencesByFactIndex[highestFactIndex] = [ sentence ]
            }
        }

        for (var factIndex = 0; factIndex < this.facts.length; factIndex++) {
            var fact = this.facts[factIndex]

            knowledge.seekToLearn(fact, factIndex)

            console.log('')
            console.log('// ' + factIndex + ' == ' + fact.toString())

            var foundSentence

            if (sentencesByFactIndex[factIndex]) {
                for (let sentence of sentencesByFactIndex[factIndex]) {
                    var studyResult = knowledge.evaluateFactSet(sentence)

                    if (!_.isEmpty(studyResult.unknownById)) {
                        throw new Error('Couldn\'t learn sentence despite order being right.')
                    }

                    var required = ''

                    if (sentence.required) {
                        var first = true

                        for (let fact of sentence.required) {
                            if (first) {
                                first = false
                            }
                            else {
                                required += ', '
                            }

                            required += 'requires:' + fact.getId()
                        }
                    }

                    console.log(sentence.toString().trim() + (required ? ' (' + required + ')' : '') + ' : ' + sentence.en().trim() )

                    knowledge.learn(studyResult, factIndex)
                }
            }

            knowledge.checkAdequateRepetition(factIndex)

            if (_.keys(knowledge.studyingById) == MAX_SIMULTANEOUS_STUDY) {
                throw new Error('Reached the limit of the number of facts simultaneously studied: ' + knowledge.studying)
            }
        }

        console.log((new Date().getTime() - t) + ' ms')

        console.log('*****************************')

        console.log('Did not manage to learn:')

        _.forEach(_.keys(knowledge.studyingById), function(unlearnedFact) {
            console.log(unlearnedFact)
        })

        console.log('')
        console.log('Words defined but not in fact order:')

        var factsById = {}

        _.forEach(Word.allWords, (word) => {
            if (this.factIndexById[word.getId()] === undefined) {
                console.log(word.toString())
            }
        })
    }

})

module.exports = {
    Knowledge: Knowledge,
    FactOrder: FactOrder
}
},{"./Word":19,"./typecheck":21,"underscore":23}],9:[function(require,module,exports){
/**
 * Constants for inflections.
 */

module.exports = {
    PAST: 'past',
    THIRDSG: '3rdsg',
    GENITIVE: 'genitive'
}

},{}],10:[function(require,module,exports){
"use strict";

require('./inheritance-clientserver.js')

/**
 * Represents a piece of grammar knowledge. It has an ID and is associated as a precondition of other facts (words or grammar)
 * or sentences. The learner is assumed to have seen an example of the application of this rule when exposed to something
 * that requires a grammar rule. After a certain number of examples it is assumed to be known. Grammar rules must therefore
 * be encoded in such a way that this is true; if rules have exceptions or irregularities these must be turned into own
 * rules.
 */
var Grammar = Class.extend({
    init: function(id) {
        this.id = id
    },

    visitFacts: function(visitor) {
        visitor(this)

        if (this.required) {
            for (let fact of this.required) {
                visitor(fact)
            }
        }
    },

    related: function() {
        // TODO: make relations symmetric
        // not implemented yet

        return this
    },

    getId: function() {
        return this.id
    },

    /** Indicates that this fact is more difficult than average (i.e. a vocabulary word) */
    isHardFact: function() {
        return true
    },

    toString: function() {
        return this.id
    },

    requiresFact: function(fact) {
        if (!this.required) {
            this.required = []
        }

        this.required.push(fact)

        return this
    }
})

module.exports = Grammar

},{"./inheritance-clientserver.js":20}],11:[function(require,module,exports){
"use strict";

require('./inheritance-clientserver.js')

var UnstudiedWord = require('./UnstudiedWord')
var Word = require('./Word')
var typecheck = require('./typecheck')

/**
 * An inflection of a word generated by Inflection. The facts assumed to be required to know it are a grammar rule
 * defining how to inflect the form (e.g. by adding an ending) and the base form; the word itself is not a fact.
 */
var Inflection = UnstudiedWord.extend({
    /**
     * @param infinitive Word representing the base form.
     */
    init: function(jp, infinitive) {
        typecheck(arguments, 'string', Word)

        this.jp = jp
        this.infinitive = infinitive
        this.en = {}
    },

    /**
     * The knowledge required for an inflection is the base form of the word as well as any gramar rules used to
     * derive it.
     */
    visitFacts: function(visitor) {
        visitor(this.infinitive)

        this.visitRequired(visitor)
    }
})

module.exports = Inflection
},{"./UnstudiedWord":18,"./Word":19,"./inheritance-clientserver.js":20,"./typecheck":21}],12:[function(require,module,exports){
"use strict";

var Word = require('./Word')
var UnstudiedWord = require('./UnstudiedWord')
var Inflection = require('./Inflection')
var _ = require('underscore')
var typecheck = require('./typecheck')

var Forms = require('./Forms')

/**
 * Rules generating inflections from base forms. See Inflection.js.
 */


const PAST = Forms.PAST
const THIRDSG = Forms.THIRDSG
const GENITIVE = Forms.GENITIVE

function endsWith(word, ending) {
    return word.substr(word.length - ending.length) === ending
}

/**
 * TODO: should support multi-letter endings in the future.
 */
function replaceEnding(word, newEndingByOldEnding) {
    typecheck(arguments, UnstudiedWord, 'object')

    var text = word.jp
    var newEnding = newEndingByOldEnding[text[text.length-1]]

    if (!newEnding) {
        throw new Error('Expected ' + text + ' to end with any of ' + _.keys(newEndingByOldEnding))
    }

    return text.substr(0, text.length - 1) + newEnding
}

function generateGerund(imperative, infinitive, grammar) {
    typecheck(arguments, UnstudiedWord, Word)

    // we are teaching the imperative before the gerund. if that changes, the required facts should also change.
    return new UnstudiedWord(imperative.jp + 'いる').setEnglish('is ' + infinitive.getEnglish() + 'ing').
        requiresFact(grammar('gerund')).requiresFact(imperative)
}

function generatePast(imperative, infinitive, grammar) {
    typecheck(arguments, UnstudiedWord, Word)

    var imperativeWord = imperative.jp

    var lastChar = imperativeWord[imperativeWord.length-1]

    if (lastChar != 'で' && lastChar != 'て') {
        throw new Error('Unexpected ending of imperative ' + imperative)
    }

    var past = imperativeWord.substr(0, imperativeWord.length-1) + (lastChar == 'て' ? 'た' : 'だ')

    if (!infinitive.getEnglish(PAST)) {
        throw new Error('Past form of ' + infinitive + ' not specified.')
    }

    return new UnstudiedWord(past).setEnglish(infinitive.getEnglish(PAST)).requiresFact(grammar('past')).requiresFact(infinitive)
}

module.exports = {

    iadj: function(infinitive, grammar) {
        typecheck(arguments, Word, 'function')

        return [
            new Inflection(replaceEnding(infinitive, {'い': 'くない'}), infinitive).setEnglish('not ' + infinitive.getEnglish()).requiresFact(grammar('kunai'))
        ]
    },

    ruverb: function(infinitive, grammar) {
        typecheck(arguments, Word, 'function')

        infinitive.setEnglish(infinitive.getEnglish() + 's', THIRDSG)

        var imperative = new UnstudiedWord(replaceEnding(infinitive, {'る': 'て'}))
            .setEnglish(infinitive.getEnglish() + '!')
            .requiresFact(grammar('imperativeTe'))
            .requiresFact(infinitive)

        var gerund = generateGerund(imperative, infinitive, grammar)
        var past = generatePast(imperative, infinitive, grammar)

        var negation = new UnstudiedWord(replaceEnding(infinitive, {'る': 'ない'}))
            .setEnglish('not ' + infinitive.getEnglish())
            .requiresFact(grammar('ruVerbsNegation'))
            .requiresFact(infinitive)

        var negativeImperative = new UnstudiedWord(replaceEnding(infinitive, {'る': 'ないで'}))
            .setEnglish('don\'t ' + infinitive.getEnglish()).
            requiresFact(negation)
            .requiresFact(grammar('negativeImperative'))

        return [
            past,
            gerund,
            negation,
            negativeImperative,
            imperative
        ]
    },

    uverb: function(infinitive, grammar) {
        typecheck(arguments, Word, 'function')
        infinitive.setEnglish(infinitive.getEnglish() + 's', THIRDSG)

        var lastChar = infinitive.jp[infinitive.jp.length-1]

        var negation = new UnstudiedWord(replaceEnding(infinitive,
            { 'く' : 'かない', 'う': 'わない', 'む': 'まない', 'す': 'さない', 'つ': 'たない', 'る': 'らない' }
        ))
            .setEnglish('not ' + infinitive.getEnglish())
            .requiresFact(grammar(lastChar == 'う' ? 'wanai' : 'anai'))
            .requiresFact(infinitive)

        var negativeImperative = new UnstudiedWord(negation + 'で')
            .setEnglish('don\'t ' + infinitive.getEnglish())
            .requiresFact(negation)
            .requiresFact(grammar('negativeImperative'))

        var imperativeText
        var imperativeGrammar = grammar('imperativeTte')

        if (infinitive.jp == '行く') {
            imperativeText = '行って'
        }
        else {
            imperativeText = replaceEnding(infinitive, {
                    'く': 'いて',
                    'む': 'んで',
                    'す': 'して',
                    'う': 'って',
                    'つ': 'って',
                    'る': 'って'
                })

            imperativeGrammar = {
                'く': grammar('imperativeIte'),
                'む': grammar('imperativeNde'),
                'す': grammar('imperativeSite'),
                'う': grammar('imperativeTte'),
                'つ': grammar('imperativeTte'),
                'る': grammar('imperativeTte')
            }[lastChar]

            if (!imperativeGrammar) {
                throw new Error('Unexpected ending of -u verb "' + infinitive + '".')
            }
        }

        var imperative = new UnstudiedWord(imperativeText)
            .setEnglish(infinitive.getEnglish() + '!')
            .requiresFact(imperativeGrammar)
            .requiresFact(infinitive)

        var gerund = generateGerund(imperative, infinitive, grammar)
        var past = generatePast(imperative, infinitive, grammar)

        return [
            past,
            gerund,
            negation,
            negativeImperative,
            imperative
        ]
    }
}
},{"./Forms":9,"./Inflection":11,"./UnstudiedWord":18,"./Word":19,"./typecheck":21,"underscore":23}],13:[function(require,module,exports){
"use strict";

var _ = require('underscore')

const DAY_IN_SEC = 100000

// if you didn't know the fact on the very first repetition knowledge
// takes 30 seconds to sink to 50%.
const DECAY = [ 0.5 / 30 ]

// we assume you never completely forget something you've once learned,
// this is the minimum chance of remembering. this not being 0 also makes
// it possible to check through getKnowledge if something was ever studied
const MINIMUM_KNOWLEDGE = 0.01

// later repetitions: knowledge falls half as fast on every repetition
while (DECAY[DECAY.length - 1] > 0.5 / 250000) {
    DECAY.push(DECAY[DECAY.length - 1] / 2)
}

class Knowledge {
    constructor() {
        /**
         * Maps IDs of facts to a tuple containing
         *  - the last time the knowledge was 1
         *  - the number of times the fact has been known
         *    (this is proportional to the strength)
         */
        this.byId = {}
    }

    getStrength(fact) {
        var tuple = this.byId[fact.getId()]

        if (!tuple) {
            return 0
        }
        else {
            let strength = tuple[1]

            return strength
        }
    }

    getKnowledge(fact, time) {
        var tuple = this.byId[fact.getId()]

        if (!tuple) {
            return 0
        }
        else {
            let lastKnownTime = tuple[0]
            let strength = tuple[1]

            var result = 1 - (time - lastKnownTime) * DECAY[strength]

            return (result >= MINIMUM_KNOWLEDGE ? result : MINIMUM_KNOWLEDGE)
        }
    }

    knew(fact, time) {
        this.updateFact(fact, time, 1)
    }

    didntKnow(fact, time) {
        this.updateFact(fact, time, 0)
    }

    updateFact(fact, time, strengthChange) {
        var tuple = this.byId[fact.getId()]

        if (!tuple) {
            this.byId[fact.getId()] = [ time, strengthChange ]
        }
        else {
            // last known time
            tuple[0] = time
            // strength
            tuple[1] += strengthChange
        }
    }
}

module.exports = Knowledge


},{"underscore":23}],14:[function(require,module,exports){
"use strict";

const REPEAT_ABOVE_STRENGTH_AT_RISK = 1
const PICK_WORD_UNDER_KNOWLEDGE = 0.3
const ALMOST_FORGOTTEN = 0.1

var _ = require('underscore')

var visitUniqueFacts = require('./visitUniqueFacts')

function reduceKnowledge(fact, iteratee, memo) {
    var result = memo

    visitUniqueFacts(fact, (fact) => {
        if (result === undefined) {
            return
        }

        // return undefined to break iteration
        result = iteratee(result, fact)
    })

    return result || memo
}

function getStrengthAtRisk(fact, factKnowledge, time) {
    return reduceKnowledge(fact, (result, fact) => {
        var knowledge = factKnowledge.getKnowledge(fact, time)

        if (knowledge == 0) {
            // break iteration
            return
        }

        if (knowledge > 0 && knowledge < 1) {
            var strength = factKnowledge.getStrength(fact)

            // if we're sure we've forgotten about the fact it's not at risk, it's gone.
            // if we're sure we know the fact it's not at risk, it's safe.
            result += knowledge * (1 - knowledge) * strength
        }

        return result
    }, 0)
}

// for each decile of the likelihood of understanding a sentence, what is the "flow value" of it,
// i.e. how much will the learner appreciate seeing it. a sentence that is 100% certain to be known
// is too easy, one that has 30% chance of being known is probably too hard.
var flowByChance = [
    /*  0 - 10% */   0, 0.01, 0.05, 0.1, 0.2,
    /* 50 - 60% */ 0.4,    1,    1, 0.6, 0, 0 ]

function flow(chanceOfUnderstanding) {
    return flowByChance[Math.floor(chanceOfUnderstanding * 10)]
}

function getChanceOfUnderstanding(sentence, sentenceKnowledge, factKnowledge, time) {
    var knowledgeOfAllFacts = 1

    visitUniqueFacts(sentence, (fact) => {
        knowledgeOfAllFacts *= factKnowledge.getKnowledge(fact)
    })

    return Math.max(knowledgeOfAllFacts, sentenceKnowledge.getKnowledge(sentence))
}

function scoreSentences(sentences, getScore) {
    var sentenceScores = []

    for (let sentence of sentences) {
        sentenceScores.push( { sentence: sentence, score: getScore(sentence) } )
    }

    sentenceScores = _.sortBy(sentenceScores, (score) => -score.score)

    return sentenceScores
}

function calculateNextSentenceMaximizingStrengthAtRisk(sentences, sentenceKnowledge, factKnowledge, time) {
    return scoreSentences(sentences, (sentence) => {
        var knowledge = sentenceKnowledge.getKnowledge(sentence)
        var strengthAtRisk = getStrengthAtRisk(sentence, factKnowledge, time)

        console.log(sentence.id, 'strengthAtRisk', strengthAtRisk, 'knowledge', knowledge, ' -> ', strengthAtRisk * (1 - knowledge))

        return strengthAtRisk * (1 - knowledge)
    })
}

function getChanceOfUnderstandingForgotten(fact, factKnowledge, time) {
    return reduceKnowledge(fact, (result, fact) => {
        var knowledge = factKnowledge.getKnowledge(fact, time)

        if (knowledge == 0) {
            // break iteration
            return
        }

        if (knowledge < ALMOST_FORGOTTEN) {
            result *= knowledge
        }

        return result
    }, 1)
}

function calculateNextSentenceAmongForgottenFacts(sentences, sentenceKnowledge, factKnowledge, time) {
    return scoreSentences(sentences, (sentence) => {
        var chance = getChanceOfUnderstandingForgotten(sentence, factKnowledge, time)

        if (chance == 1 || chance == 0) {
            return 0
        }

        // 0 knowledge for unknown sentence is not good, but we do prefer better known sentences since it
        // makes it easier to recognize the word
        var knowledge = 0.5 + sentenceKnowledge.getKnowledge(sentence)

        console.log(sentence.id, 'chance', chance, 'sentenceKnowledge', knowledge, ' -> ', chance * knowledge)

        return chance * knowledge
    })
}

class DelegatingKnowledge {
    constructor(delegate) {
        this.delegate = delegate
    }

    getStrength(fact) {
        return delegate.getStrength(fact)
    }

    getKnowledge(fact, time) {
        return delegate.getKnowledge(fact, time)
    }
}

class ExtendedKnowledge extends DelegatingKnowledge {
    constructor(delegate, newFact) {
        super(delegate)

        this.newFact = newFact
    }

    getKnowledge(fact, time) {
        if (fact.getId() == this.newFact.getId()) {
            return 0.01
        }
        else {
            return this.delegate.getKnowledge(fact, time)
        }
    }
}

function calculateNextSentence(sentences, sentenceKnowledge, factKnowledge, factOrder, time) {
    var sentenceScores = calculateNextSentenceMaximizingStrengthAtRisk(sentences, sentenceKnowledge, factKnowledge, time)

    if (!sentenceScores.length || sentenceScores[0].score < PICK_WORD_UNDER_KNOWLEDGE) {
        for (let fact of factOrder) {
            if (factKnowledge.getKnowledge(fact, time) == 0) {
                console.log('next fact', fact)

                factKnowledge = new ExtendedKnowledge(factKnowledge, fact)

                break
            }
        }

        sentenceScores = calculateNextSentenceAmongForgottenFacts(sentences, sentenceKnowledge, factKnowledge, time)
    }

    return sentenceScores
}


function knowledgeOfAllFacts(knowledge, fact, time) {
    var result = 1

    fact.visitFacts((fact) => {
        result *= knowledge.getKnowledge(fact, time)
    })

    return result
}

module.exports = {
    flow: flow,
    getStrengthAtRisk: getStrengthAtRisk,
    getChanceOfUnderstanding: getChanceOfUnderstanding,
    calculateNextSentenceMaximizingStrengthAtRisk: calculateNextSentenceMaximizingStrengthAtRisk,
    calculateNextSentenceAmongForgottenFacts: calculateNextSentenceAmongForgottenFacts,
    calculateNextSentence: calculateNextSentence,
    ALMOST_FORGOTTEN: ALMOST_FORGOTTEN
}
},{"./visitUniqueFacts":22,"underscore":23}],15:[function(require,module,exports){
"use strict";

var _ = require('underscore')
var Word = require('./Word').Word
var UnstudiedWord = require('./UnstudiedWord')

/**
 * A sentence is a list of Japanese words with an English translation. It can optionally require certain grammar facts.
 */
var Sentence = Class.extend({
    init: function(words, id) {
        this.words = words
        this.id = id
    },

    getId: function() {
        if (this.id === undefined) {
            throw new Error('No ID present.')
        }

        return this.id
    },

    setEnglish: function(en) {
        this.english = en
    },

    en: function() {
        return this.english
    },

    jp: function() {
        var res = ''

        for (let word of this.words) {
            res += word.jp + ' '
        }

        return res
    },

    requiresFact: function(fact) {
        if (!this.required) {
            this.required = []
        }

        this.required.push(fact)

        return this
    },

    visitFacts: function(visitor) {
        for (let word of this.words) {
            word.visitFacts(visitor)
        }

        if (this.required) {
            for (let fact of this.required) {
                fact.visitFacts(visitor)
            }
        }
    },

    toString: function() {
        var res = ''

        for (let word of this.words) {
            res += word.toString() + ' '
        }

        return res
    }
})

module.exports = Sentence
},{"./UnstudiedWord":18,"./Word":19,"underscore":23}],16:[function(require,module,exports){
"use strict";

var Sentence = require('./Sentence')
var typecheck = require('./typecheck')
var _ = require('underscore')

/**
 * Reads a file of sentences. See parseLine for the format.
 */

/**
 * Parses a Japanese sentence (words delimited by spaces) into Words.
 */
function parseSentenceToWords(sentence, wordsById) {
    var words = []

    for (let token of sentence.split(' ')) {
        if (!token) {
            continue
        }

        let word = wordsById[token]

        if (!word) {
            let similar = _.filter(_.keys(wordsById), (word) => word[0] == token[0])

            throw new Error('Unknown word "' + token + '" in "' + sentence + '".' + (similar.length ? ' Did you mean any of ' + similar + '?' : ''))
        }

        words.push(word)
    }

    return words
}

/**
 * Given a line of the form <japanese> (requires: grammar): <english> and function that parses Japanese sentences to Word arrays,
 * return the object
 * {
 *   tags: [ [ 'requires', 'grammar'], ... ]
 *   words: [ ... ]
 *   english: 'English sentence'
 * }
 */
function parseLine(line, parseSentenceToWords) {
    var r = /([^(:]*)(?:\((.*)\))? *:(.*)/

    var m = r.exec(line)

    if (!m) {
        throw new Error('Every line should have the form <japanese> (requires: grammar): <english>. (The requires part is optional). "' + line + '" does not follow this convention.')
    }

    var japanese = m[1]
    var english = m[3]
    var tags = m[2]

    var result = {
        tags: []
    }

    if (tags) {
        for (let element of tags.split(',')) {
            let split = _.map(element.split(':'), (s) => s.trim())

            if (split.length != 2) {
                throw new Error('Each element tagging a sentence should consist of <tag>:<value>, where <tag> is e.g. "requires". The element "' + element + '" does not have a colon.')
            }

            result.tags.push(split)
        }
    }

    result.words = parseSentenceToWords(japanese)

    result.english = english.trim()

    return result
}

module.exports = (data, wordsById, grammar) => {
    typecheck([data, wordsById, grammar], 'string', 'object', 'function')

    var sentences = []

    for (let line of data.split('\n')) {
        if (!line || line.substr(0, 2) == '//') {
            continue
        }

        var elements = parseLine(line, (sentence) => parseSentenceToWords(sentence, wordsById, grammar))

        var sentence = new Sentence(elements.words)

        // TODO: the IDs of sentences should be persistant after updates of the knowledge base.
        sentence.id = sentence.toString()

        sentence.setEnglish(elements.english)

        for (let tag of elements.tags) {
            let name = tag[0]
            let value = tag[1]

            if (name == 'requires') {
                sentence.requiresFact(grammar(value))
            }
        }

        sentences.push(sentence)
    }

    return sentences
}

},{"./Sentence":15,"./typecheck":21,"underscore":23}],17:[function(require,module,exports){
"use strict";

var _ = require('underscore')
var Word = require('./Word').Word
var UnstudiedWord = require('./UnstudiedWord')

var Set = Class.extend({
    init: function(itemArray) {
        this.items = []
        this.addAll(itemArray)

        if (_.uniq(itemArray).length != itemArray.length) {
            throw new Error('Duplicates in set.')
        }
    },

    addAll: function(itemArray) {
        _.forEach(itemArray, (item, index) => {
            if (item instanceof Set) {
                this.addAll(item.items)
            }
            else if (!item) {
                throw new Error('Word ' + index + ' is not defined (other items: ' +
                    _.map(itemArray, function(a) { return a && a.toString()}).join(', ') + ').')
            }
            else {
                this.items.push(item)
            }
        })
    },

    toString: function() {
        return '[' + this.items.join(', ') + ']'
    }
})

var SetRef = Class.extend({
    init: function (index, form) {
        this.index = index
        this.form = form
    }
})

var SentenceSetSentence = Class.extend({
    init: function(sentenceSet, setValues) {
        if (!(sentenceSet instanceof SentenceSet)) {
            throw new Error('Unexpected sentence ' + sentenceSet)
        }

        this.sentenceSet = sentenceSet
        this.setValues = setValues
    },

    en: function() {
        var res = ''
        var atSet = 0

        if (!this.sentenceSet.en) {
            throw new Error('No English translation of ' + this)
        }

        for (var i = 0; i < this.sentenceSet.en.length; i++) {
            var item = this.sentenceSet.en[i]

            if (item instanceof SetRef) {
                var en = this.setValues[item.index].getEnglish(item.form)

                if (!en) {
                    throw new Error(this.setValues[item.index] + ' lacks form "' + item.form + '" in ' + this)
                }

                item = en
            }

            if ('\'.,!?'.indexOf(item[0]) < 0) {
                res += ' '
            }

            res += item
        }

        return res
    },

    forEachWord: function(visitor) {
        var atSet = 0

        for (var i = 0; i < this.sentenceSet.words.length; i++) {
            var word = this.sentenceSet.words[i]

            if (word instanceof Set) {
                visitor(this.setValues[atSet++])
            }
            else {
                visitor(word)
            }
        }
    },

    jp: function() {
        var res = ''

        this.forEachWord((word) => {
            res += word.jp + ' '
        })

        return res
    },

    visitFacts: function(visitor) {
        if (this.sentenceSet.required) {
            for (let fact of this.sentenceSet.required) {
                fact.visitFacts(visitor)
            }
        }

        _.forEach(this.sentenceSet.words, function(item) {
            if (!(item instanceof Set)) {
                item.visitFacts(visitor)
            }
        })

        _.forEach(this.setValues, function(item) {
            item.visitFacts(visitor)
        })
    },

    toString: function() {
        var res = ''

        this.forEachWord((word) => {
            res += word.toString() + ' '
        })

        return res
    }
})

var SentenceSet = Class.extend({
    init: function(words, id) {
        _.forEach(words, function(word, index) {
            if (!word) {
                throw new Error('Word ' + index + ' is not defined')
            }

            if (!(word instanceof Set) && !(word instanceof UnstudiedWord)) {
                throw new Error('Word ' + word + ' at index ' + index +
                    ' is not a word, particle or set')
            }
        })

        this.id = id
        this.words = words
    },

    setEnglish: function(word1, word2, etc) {
        this.en = _.toArray(arguments)

        var sets = _.filter(this.words, function(word) {
            return (word instanceof Set)
        })

        var refs = []

        _.forEach(this.en, (word, index) => {
            if (!word) {
                throw new Error('Word ' + index + ' is not defined')
            }

            if (word instanceof SetRef) {
                refs.push(word.index)

                if (word.index >= sets.length) {
                    throw new Error('Out of range set ref in ' + this)
                }
            }

            if (!(word instanceof SetRef) && !(typeof word == 'string')) {
                throw new Error('Word ' + word + ' at index ' + index +
                    ' is not a word or set ref')
            }
        })

        // there may be multiple references to the same set in reflexive sentences
        var refCount = _.uniq(refs).length;

        if (refCount != sets.length) {
            throw new Error(refCount + ' set references but ' + sets.length + ' sets.')
        }

        return this
    },

    sets: function() {
        var result = []

        _.forEach(this.words, function(word, index) {
            if (word instanceof Set) {
                result.push(word)
            }
        })

        return result
    },

    permutations: function() {
        var sets = this.sets()
        var sentenceSet = this

        var result = []

        var setValues = []

        for (var i = 0; i < sets.length; i++) {
            setValues.push(null)
        }

        var permutate = (index) => {
            for (var i = 0; i < sets[index].items.length; i++) {
                setValues[index] = sets[index].items[i]

                if (index < sets.length-1) {
                    permutate(index + 1)
                }
                else {
                    result.push(new SentenceSetSentence(sentenceSet, setValues.slice(0, setValues.length)))
                }
            }
        }

        if (sets.length) {
            permutate(0)
        }
        else {
            result.push(new SentenceSetSentence(sentenceSet, []))
        }

        return result
    },

    requiresFact: function(fact) {
        if (!this.required) {
            this.required = []
        }

        this.required.push(fact)

        return this
    },

    toString: function() {
        return this.words.join(', ')
    }
})

function set(item1, item2, item3, etc) {
    return new Set(arguments)
}

function setRef(index, form) {
    index = index || 0

    return new SetRef(index, form)
}

module.exports = {
    SentenceSet: SentenceSet,
    set: set,
    setRef: setRef,
}

},{"./UnstudiedWord":18,"./Word":19,"underscore":23}],18:[function(require,module,exports){
"use strict";

require('./inheritance-clientserver.js')

/**
 * An UnstudiedWord is a Word that is not a fact, i.e. it is not studied in its own right. Typically, all unstudied words
 * require grammar rules that represent the real knowledge required. An example might be the construct "<noun>は<noun>がある"
 * that should be explained by a single grammar rule after which no further studies for the individual particles is needed.
 *
 * Sometimes, there are multiple words that share spelling but have different meanings or should for other reasons be
 * studied separately. These are distinguished by "classifiers", e.g. there is に[loc] ("loc" being the classifier)
 * for specifying location and に[dir] for specifying direction.
 */
var UnstudiedWord = Class.extend({
    init: function(jp, classifier) {
        this.jp = jp
        this.classifier = classifier
        this.en = {}
    },

    explanation: function(expl) {
        this.expl = expl

        return this
    },

    related: function(fact) {
        // unused for now

        return this
    },

    requiresFact: function(fact) {
        if (!fact) {
            throw new Error('No fact.')
        }

        if (!this.required) {
            this.required = []
        }

        this.required.push(fact)

        return this
    },

    visitFacts: function (visitor) {
        this.visitRequired(visitor)
    },

    visitRequired: function(visitor) {
        if (this.required) {
            for (let fact of this.required) {
                if (fact.visitFacts) {
                    fact.visitFacts(visitor)
                }
                else {
                    visitor(fact)
                }
            }
        }
    },

    getEnglish: function(form) {
        if (!form) {
            form = ''
        }

        var result = this.en[form]

        if (!result) {
            throw new Error('Form ' + form + ' not present among English translations of "' + this + '".')
        }

        return result
    },

    setEnglish: function(en, form) {
        if (!form) {
            form = ''
        }

        if (this.en[form]) {
            throw new Error(this + ' already had the English translation "' + this.en[form] +
                '" in form "' + form + '". Attempting to add another translation "' + en + '"')
        }

        this.en[form] = en

        return this
    },

    /**
     * This is the form used in sentence files (SentenceFileReader)
     */
    toString: function() {
        return this.jp + (this.classifier ? '[' + this.classifier + ']' : '')
    }
})

module.exports = UnstudiedWord
},{"./inheritance-clientserver.js":20}],19:[function(require,module,exports){
"use strict";

require('./inheritance-clientserver.js')

var UnstudiedWord = require('./UnstudiedWord')

/**
 * A word has a Japanese spelling, an English translation an optional list of grammar that is required to understand it.
 */
var Word = UnstudiedWord.extend({
    visitFacts: function(visitor) {
        visitor(this)

        this.visitRequired(visitor)
    },

    getId: function() {
        return this.jp + (this.classifier ? '[' + this.classifier + ']' : '')
    }
})

module.exports = Word
},{"./UnstudiedWord":18,"./inheritance-clientserver.js":20}],20:[function(require,module,exports){
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function(){};

    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn){
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if ( !initializing && this.init )
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();

},{}],21:[function(require,module,exports){
function typecheck(args, type1, type2, etc) {
    for (var i = 0; i < arguments.length-1; i++) {
        var expectedType = arguments[i + 1]
        var argument = args[i]

        if (typeof expectedType == 'string') {
            if (typeof argument !== expectedType) {
                throw new Error('Expected argument ' + i + ' to be a ' + expectedType + ' but was ' + typeof argument)
            }
        }
        else {
            if (!(argument instanceof expectedType)) {
                throw new Error('Expected argument ' + i + ' to be a ' + expectedType + ' but was ' + typeof argument)
            }
        }
    }
}

module.exports = typecheck
},{}],22:[function(require,module,exports){
module.exports =
    function(sentence, visitor) {
        var seenFacts = {}

        sentence.visitFacts((fact) => {
            if (!seenFacts[fact.getId()]) {
                visitor(fact)

                seenFacts[fact.getId()] = true
            }
        })
    }

},{}],23:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]);
