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