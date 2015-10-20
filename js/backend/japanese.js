"use strict";

var _ = require('underscore')
var fs = require('fs')

var typecheck = require('../shared/typecheck')

require('../shared/inheritance-clientserver.js')

var Grammar = require('../shared/Grammar')
var Word = require('../shared/Word')

var UnstudiedWord = require('../shared/UnstudiedWord')
var Inflection = require('../shared/Inflection')

var sentenceSetModule = require('../shared/SentenceSet')

var SentenceSet = sentenceSetModule.SentenceSet
var set = sentenceSetModule.set
var setRef = sentenceSetModule.setRef

var FactOrder = require('../shared/FactOrder').FactOrder
var FactFileReader = require('./FactFileReader')
var SentenceFileReader = require('./SentenceFileReader')

var grammarById = {}
var allSentences = []

var Forms = require('../shared/Forms')

const PAST = Forms.PAST
const THIRDSG = Forms.THIRDSG
const GENITIVE = Forms.GENITIVE

function addGrammar(id, desc) {
    if (grammarById[id]) {
        throw new Error('Grammar fact "' + id  + '" already exists.')
    }

    grammarById[id] = new Grammar(id, desc)
}

function grammar(id) {
    var result = grammarById[id]

    if (!result) {
        throw new Error('No grammar fact "' + id + '"')
    }
    
    return result
}


addGrammar('ellipsis', 'A complete sentence in Japanese can be a single verb, whereas in English a lot more is required'),
addGrammar('plural', 'Whether a word is singular or plural can often only be inferred ' +
    'from the context so in many of our sentences both could be meant.'),
addGrammar('kunai'),
addGrammar('questions'),
addGrammar('toshite'),
addGrammar('nokoto'),
addGrammar('toDirectSpeech', 'more or less: direct speech'),
addGrammar('toPerson', 'With 話す: the person being spoken to.'),
addGrammar('ha'),
addGrammar('ga'),
addGrammar('haGaHas', '<person> は <thing> がある is used in the meaning "<person> has <thing>"'),
addGrammar('no', 'indicates that something belongs to someone, the same function \'s has in English'),
addGrammar('wo'),
addGrammar('niLoc', 'indicates the location when talking about where an object or a person is (いる　/ ある)'),
addGrammar('niDir', 'indicates a direction of movement'),
addGrammar('niMeet', 'With the word 会う (to meet) に indicates the person you are meeting.'),
addGrammar('niKyoumi'),

addGrammar('deLoc', 'indicates the location (except when using いる or　ある)'),
addGrammar('deMeans', 'indicates the means by which something is done'),
addGrammar('nai', 'ない is the negation of ある'), // .related(ある),
addGrammar('inai', 'いない is the negation of いる and therefore means "is not there" ' +
    '(recall that いる is used about people and animals, ない is used about things'), //.related(いる)
addGrammar('iiToYo', 'いい　(meaning "good") often turns to よ- when inflected.'),
addGrammar('ruVerbsNegation', 'The negative of a -ru verb is formed by replacing -ru with -ra.'),
addGrammar('anai', 'The negative of a -u verb is formed by replacing -u with -anai.'),
addGrammar('wanai', 'The negative of a verb ending in う is formed by replacing う with わない.'),
addGrammar('amari', 'あまり。。ない　means "almost never." Only used in combination with a negative verb form.'),
addGrammar('imperativeTe', 'Tells someone to do something. For verbs ending in -ru (but not -oro, -aru or -uru).'),
addGrammar('imperativeNde', 'Tells someone to do something. For verbs ending in -mu in the infinitive.'),
addGrammar('imperativeIte', 'Tells someone to do something. For verbs ending in -ku in the infinitive (except 行く).'),
addGrammar('imperativeSite', 'Tells someone to do something. For verbs ending in -su in the infinitive.'),
addGrammar('imperativeTte', 'Tells someone to do something. For verbs ending in -う, -つ, -uru, -oro or -aru in the infinitive.　Also used for 行く.'),
addGrammar('past', 'The past form is identical to the imperative (-て) except that it ends with a た.'),
addGrammar('gerund', 'Indicates that some action is ongoing. Formed by taking the -て (imperative) form of the verb and adding いる.'),
addGrammar('negativeImperative', 'To tell someone not to do something, add で to the negative.')

addGrammar('iruVsAru', 'いる is used about people, ある about things.')
// todo: future similarly to plural

grammar('imperativeTe').related(grammar('imperativeTte'))
// Todo: all imperatives related to all imperatives. somehow group in a topic concept?

grammar('wanai').requiresFact(grammar('anai'))
grammar('deLoc').related(grammar('niLoc'))
grammar('deLoc').related(grammar('deMeans'))



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


function isFact(word) {
    return !!word.getId
}


/*
けど
が
の


suru-verb:
     利用:use
     使用:also use?
     検索
     機能-N suru . to work

     -中 som suffix på suru-verb

    の前
    の後
    のとなり

    の後ろ

    考える
    手
    女性
    男性

     技術 technology

     化す

     歳

     写真
     僕

     情報:information
     情報をもらう
     必要な情報
     重要な
    受ける
     求める

     トムはメアリーが必要な情報を持っている。




     時間:time
     会社:company
     問題:problem
     持つ:hold

    animateはareaにいる。
    家に(本・テーブル)が(よく・)ある。
    家に(本・テーブル)があった。
    車に(本・携帯)がある。
    キムは(よく・)(area・家)に行く。
    キムはvehicleで(area・家)に行く。
    vehicleは(早い・遅い)
        vehicleは(早かった・遅かった)
        犬は家に行く。
    キムは(小さい・)(犬・車・家)がある。
    キムはareaにいる。
    (キム・ボッブ・友達)　は　(本・雑誌・新聞)　を　もう　(読んだ・買った・捨てた)。
    animateはテレビを(よく・)　(見る・見た）。
    animateはnounを見る。
    animateはanimateを見る。
    animateはanimateの(家・アパート)に行く。
    */


    /*

    pending topics:

     子供は誕生日に携帯をもらう
     子供の誕生日だ
     彼女の誕生日に日本に行く



    v-ruVerbsNegation
    ja nai

    zenzen nai

    なにもない
    何か

    nationalities and languages

    な adjectives

    -masu

    kore, sore

    past
    yesterday / tomorrow / before / monday / in an hour ...

    suru. noun (利用) + suru, soudan suru

    adverb

    gerund

    colors

     */

var corpusDir = '../../public/corpus/hiragana'

FactFileReader(corpusDir + '/facts.txt', grammar).then(
    (words) => {
        let wordsById = {}

        for (let word of words) wordsById[word.toString()] = word

        return SentenceFileReader(corpusDir + '/words.txt', wordsById, grammar).then((sentences) => {
            new FactOrder(_.filter(words, isFact)).evaluateConsistency(sentences)
        })
    }).done()