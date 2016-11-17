import { del } from 'request';
import { reverse } from 'dns';
import { wordToStudyWord } from '../study/toStudyWords';
import { NamedWordForm, WordForm } from './WordForm';
import * as Dim from './Dimensions'

export const WORD_FORMS: { [id: string] : NamedWordForm } = {

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
    adjneg: new NamedWordForm('adjneg', { pos: Dim.PartOfSpeech.ADJECTIVE, negation: Dim.Negation.NEGATIVE  }),
    adjpos: new NamedWordForm('adjpos', { pos: Dim.PartOfSpeech.ADJECTIVE, negation: Dim.Negation.POSITIVE }),

    adv: new NamedWordForm('adv', { pos: Dim.PartOfSpeech.ADVERB }),
    prep: new NamedWordForm('prep', { pos: Dim.PartOfSpeech.PREPOSITION }),
    pron: new NamedWordForm('pron', { pos: Dim.PartOfSpeech.PRONOUN }),
    poss: new NamedWordForm('poss', { pos: Dim.PartOfSpeech.POSSESSIVE }),
    number: new NamedWordForm('number', { pos: Dim.PartOfSpeech.NUMBER }),
    quest: new NamedWordForm('quest', { pos: Dim.PartOfSpeech.QUESTION }),
    conj: new NamedWordForm('conj', { pos: Dim.PartOfSpeech.CONJUNCTION }),
    part: new NamedWordForm('part', { pos: Dim.PartOfSpeech.PARTICLE }),

    perf: new NamedWordForm('perf', { aspect: Dim.Aspect.PERFECTIVE, pos: Dim.PartOfSpeech.VERB }),
    imperf: new NamedWordForm('imperf', { aspect: Dim.Aspect.IMPERFECTIVE, pos: Dim.PartOfSpeech.VERB }),

    reflex: new NamedWordForm('reflex', { reflex: Dim.Reflexivity.REFLEXIVE, pos: Dim.PartOfSpeech.VERB }),
    nonreflex: new NamedWordForm('nonreflex', { reflex: Dim.Reflexivity.NON_REFLEXIVE, pos: Dim.PartOfSpeech.VERB }),

}

export default WORD_FORMS

export interface Derivation {
    id: string,
    toForm: NamedWordForm
    isForward: boolean
}

const DERIVATIONS: 
    { [ wordForm : string ] : Derivation[] } = {} 
const REVERSE_DERIVATION: 
    { [ from: string ] : string } = {}

export function getDerivations(wordForm: WordForm): Derivation[] {
    let result = []

    Object.keys(DERIVATIONS).forEach(formId => {
        if (wordForm.matches(WORD_FORMS[formId])) {
            result = result.concat(DERIVATIONS[formId])
        }
    })

    return result
}

export function getReverseDerivation(derivation: string): string {
    return REVERSE_DERIVATION[derivation]
} 

export function getNonRedundantNamedForms(wordForm: WordForm): NamedWordForm[] {
    let forms = Object.keys(WORD_FORMS)
        .filter(id => wordForm.matches(WORD_FORMS[id]))
        .map(id => WORD_FORMS[id])

    if (forms.length > 1) {
        // eliminate redundant forms
        forms = forms.filter(form => !forms.find(superSetForm => 
            form.id != superSetForm.id && superSetForm.matches(form)))
    }

    return forms
}

function addDerivation(fromForm: NamedWordForm, toForm: NamedWordForm, derivation: string, reverseDerivation: string) {
    function addOneDirection(fromForm: NamedWordForm, toForm: NamedWordForm, derivation: string, isForward: boolean) {
        let d = DERIVATIONS[fromForm.id]

        if (!d) {
            d = []
            DERIVATIONS[fromForm.id] = d
        }

        d.push({
            id: derivation,
            toForm: toForm,
            isForward: isForward
        })
    }

    if (toForm == null || fromForm == null) {
        console.error('No form for derivation ' + derivation)
        return
    }

    addOneDirection(fromForm, toForm, derivation, true)
    addOneDirection(toForm, fromForm, reverseDerivation, false)

    REVERSE_DERIVATION[derivation] = reverseDerivation 
    REVERSE_DERIVATION[reverseDerivation] = derivation 
}

addDerivation(WORD_FORMS['nonreflex'], WORD_FORMS['reflex'], 'reflex', 'nonreflex')
addDerivation(WORD_FORMS['imperf'], WORD_FORMS['perf'], 'perf', 'imperf')
addDerivation(WORD_FORMS['adjpos'], WORD_FORMS['adjneg'], 'neg', 'pos')
addDerivation(WORD_FORMS['adj'], WORD_FORMS['adv'], 'adv', 'adj')
addDerivation(WORD_FORMS['pron'], WORD_FORMS['quest'], 'quest', 'pron')
addDerivation(WORD_FORMS['pron'], WORD_FORMS['poss'], 'poss', 'pron')
