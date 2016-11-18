import { del } from 'request';
import { reverse } from 'dns';
import { wordToStudyWord } from '../study/toStudyWords';
import { NamedWordForm, WordForm } from './WordForm';
import * as Dim from './Dimensions'

export const WORD_FORMS: { [id: string] : NamedWordForm } = {

    nounf: new NamedWordForm('nounf', 'Feminine Nouns', { pos: Dim.PartOfSpeech.NOUN, gender: Dim.Gender.F }),
    nounm: new NamedWordForm('nounm', 'Masculine Nouns', { pos: Dim.PartOfSpeech.NOUN, gender: Dim.Gender.M }),
    nounn: new NamedWordForm('nounn', 'Neuter Nouns', { pos: Dim.PartOfSpeech.NOUN, gender: Dim.Gender.N }),
    animate: new NamedWordForm('animate', 'Animate Words', { animate: Dim.Animateness.ANIMATE }),
    'accord1sg': new NamedWordForm('accord1sg', 'Words that go with the first person singular', 
        { person: Dim.Person.FIRST, number: Dim.GrammarNumber.SINGULAR}),
    'accord2sg': new NamedWordForm('accord2sg', 'Words that go with the second person singular',
        { person: Dim.Person.SECOND, number: Dim.GrammarNumber.SINGULAR}),
    'accord3sg': new NamedWordForm('accord3sg', 'Words that go with the third person singular',
        { person: Dim.Person.THIRD, number: Dim.GrammarNumber.SINGULAR}),
    'accord1pl': new NamedWordForm('accord1pl', 'Words that go with the first person plural',
        { person: Dim.Person.FIRST, number: Dim.GrammarNumber.PLURAL}),
    'accord2pl': new NamedWordForm('accord2pl', 'Words that go with the second person plural',
        { person: Dim.Person.SECOND, number: Dim.GrammarNumber.PLURAL}),
    'accord3pl': new NamedWordForm('accord3pl', 'Words that go with the third person singular',
        { person: Dim.Person.THIRD, number: Dim.GrammarNumber.PLURAL}),
    en_sg: new NamedWordForm('en_sg', 
        'Nouns used in the plural in Russian (but not English)',
        { numberEn: Dim.GrammarNumber.SINGULAR }),
    en_pl: new NamedWordForm('en_pl', 
        'Nouns used in the singular in Russian (but not English)',
        { numberEn: Dim.GrammarNumber.PLURAL }),

    n: new NamedWordForm('n', 'Nouns', { pos: Dim.PartOfSpeech.NOUN }),
    v: new NamedWordForm('v', 'Verbs', { pos: Dim.PartOfSpeech.VERB }),
    adj: new NamedWordForm('adj', 'Adjectives', { pos: Dim.PartOfSpeech.ADJECTIVE }),
    adjneg: new NamedWordForm('adjneg', 'Negated Adjectives', 
        { pos: Dim.PartOfSpeech.ADJECTIVE, negation: Dim.Negation.NEGATIVE  }),
    adjpos: new NamedWordForm('adjpos', 'Non-negated Adjectives', 
        { pos: Dim.PartOfSpeech.ADJECTIVE, negation: Dim.Negation.POSITIVE }),

    adv: new NamedWordForm('adv', 'Adverbs', { pos: Dim.PartOfSpeech.ADVERB }),
    advneg: new NamedWordForm('advneg', 'Negated Adverbs', 
        { pos: Dim.PartOfSpeech.ADVERB, negation: Dim.Negation.NEGATIVE  }),
    advpos: new NamedWordForm('advpos', 'Non-negated Adverbs', 
        { pos: Dim.PartOfSpeech.ADVERB, negation: Dim.Negation.POSITIVE }),

    prep: new NamedWordForm('prep', 'Prepositions', { pos: Dim.PartOfSpeech.PREPOSITION }),
    pron: new NamedWordForm('pron', 'Pronouns', { pos: Dim.PartOfSpeech.PRONOUN }),
    poss: new NamedWordForm('poss', 'Possessive Pronouns', { pos: Dim.PartOfSpeech.POSSESSIVE }),
    number: new NamedWordForm('number', 'Numbers', { pos: Dim.PartOfSpeech.NUMBER }),
    quest: new NamedWordForm('quest', 'Question Words', { pos: Dim.PartOfSpeech.QUESTION }),
    conj: new NamedWordForm('conj', 'Conjunction', { pos: Dim.PartOfSpeech.CONJUNCTION }),
    part: new NamedWordForm('part', 'Particles', { pos: Dim.PartOfSpeech.PARTICLE }),

    perf: new NamedWordForm('perf', 'Perfective Verbs', { aspect: Dim.Aspect.PERFECTIVE, pos: Dim.PartOfSpeech.VERB }),
    imperf: new NamedWordForm('imperf', 'Imperfective Verbs', { aspect: Dim.Aspect.IMPERFECTIVE, pos: Dim.PartOfSpeech.VERB }),

    reflex: new NamedWordForm('reflex', 'Reflexive Verbs', { reflex: Dim.Reflexivity.REFLEXIVE, pos: Dim.PartOfSpeech.VERB }),
    nonreflex: new NamedWordForm('nonreflex', 'Non-reflexive Verbs', { reflex: Dim.Reflexivity.NON_REFLEXIVE, pos: Dim.PartOfSpeech.VERB }),

}

export default WORD_FORMS

export interface Derivation {
    id: string,
    toForm: NamedWordForm
    isForward: boolean
}

export const DERIVATION_BY_ID: 
    { [ ID : string ] : Derivation } = {} 
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
    function addOneDirection(fromForm: NamedWordForm, toForm: NamedWordForm, derivationId: string, isForward: boolean) {
        let d = DERIVATIONS[fromForm.id]

        if (!d) {
            d = []
            DERIVATIONS[fromForm.id] = d
        }

        let derivation = {
            id: derivationId,
            toForm: toForm,
            isForward: isForward
        }
        
        d.push(derivation)

        DERIVATION_BY_ID[derivationId] = derivation
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
