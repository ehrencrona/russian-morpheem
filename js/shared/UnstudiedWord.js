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
class UnstudiedWord {
    constructor(jp, classifier) {
        this.jp = jp
        this.classifier = classifier
        this.en = {}
    }

    related(fact) {
        // unused for now

        return this
    }

    requiresFact(fact) {
        if (!fact) {
            throw new Error('No fact.')
        }

        if (!this.required) {
            this.required = []
        }

        this.required.push(fact)

        return this
    }

    visitFacts(visitor) {
        this.visitRequired(visitor)
    }

    visitRequired(visitor) {
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
    }

    getEnglish(form) {
        if (!form) {
            form = ''
        }

        var result = this.en[form]

        if (!result) {
            throw new Error('Form ' + form + ' not present among English translations of "' + this + '".')
        }

        return result
    }

    setEnglish(en, form) {
        if (!form) {
            form = ''
        }

        if (this.en[form]) {
            throw new Error(this + ' already had the English translation "' + this.en[form] +
                '" in form "' + form + '". Attempting to add another translation "' + en + '"')
        }

        this.en[form] = en

        return this
    }

    /**
     * This is the form used in sentence files (SentenceFileReader)
     */
    toString() {
        return this.jp + (this.classifier ? '[' + this.classifier + ']' : '')
    }
}

module.exports = UnstudiedWord