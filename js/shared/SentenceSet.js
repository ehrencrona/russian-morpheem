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
