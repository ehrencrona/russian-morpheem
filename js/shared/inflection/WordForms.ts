import { NamedWordForm } from './WordForm'
import * as Dim from './Dimensions'

const WORD_FORMS: { [id: string] : NamedWordForm } = {

    nounf: new NamedWordForm('nounf', { pos: Dim.PartOfSpeech.NOUN, gender: Dim.Gender.F }),
    nounm: new NamedWordForm('nounm', { pos: Dim.PartOfSpeech.NOUN, gender: Dim.Gender.M }),
    nounn: new NamedWordForm('nounn', { pos: Dim.PartOfSpeech.NOUN, gender: Dim.Gender.N }),
    animate: new NamedWordForm('animate', { animate: Dim.Animateness.ANIMATE }),
    '1sg': new NamedWordForm('1sg', { person: Dim.Person.FIRST, number: Dim.GrammarNumber.SINGULAR}),
    '2sg': new NamedWordForm('2sg', { person: Dim.Person.SECOND, number: Dim.GrammarNumber.SINGULAR}),
    '3sg': new NamedWordForm('3sg', { person: Dim.Person.THIRD, number: Dim.GrammarNumber.SINGULAR}),
    '1pl': new NamedWordForm('1pl', { person: Dim.Person.FIRST, number: Dim.GrammarNumber.PLURAL}),
    '2pl': new NamedWordForm('2pl', { person: Dim.Person.SECOND, number: Dim.GrammarNumber.PLURAL}),
    '3pl': new NamedWordForm('3pl', { person: Dim.Person.THIRD, number: Dim.GrammarNumber.PLURAL}),
    en_sg: new NamedWordForm('en_sg', { numberEn: Dim.GrammarNumber.SINGULAR }),
    en_pl: new NamedWordForm('en_pl', { numberEn: Dim.GrammarNumber.PLURAL }),

    n: new NamedWordForm('n', { pos: Dim.PartOfSpeech.NOUN }),
    v: new NamedWordForm('v', { pos: Dim.PartOfSpeech.VERB }),
    adj: new NamedWordForm('adj', { pos: Dim.PartOfSpeech.ADJECTIVE }),
    adv: new NamedWordForm('adv', { pos: Dim.PartOfSpeech.ADVERB }),
    prep: new NamedWordForm('pron', { pos: Dim.PartOfSpeech.PREPOSITION }),
    pron: new NamedWordForm('pron', { pos: Dim.PartOfSpeech.PRONOUN }),
    possessive: new NamedWordForm('poss', { pos: Dim.PartOfSpeech.POSSESSIVE }),
    number: new NamedWordForm('number', { pos: Dim.PartOfSpeech.NUMBER }),
    quest: new NamedWordForm('quest', { pos: Dim.PartOfSpeech.QUESTION }),
    conj: new NamedWordForm('conj', { pos: Dim.PartOfSpeech.CONJUNCTION }),

    perf: new NamedWordForm('perf', { aspect: Dim.Aspect.PERFECTIVE }),
    imperf: new NamedWordForm('imperf', { aspect: Dim.Aspect.IMPERFECTIVE }),

}

export default WORD_FORMS