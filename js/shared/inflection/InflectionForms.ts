import Fact from '../fact/Fact'
import AbstractFact from '../fact/AbstractFact'
import { Gender, GrammarNumber, GrammarCase, Tense, Person, 
    AdjectiveForm, Command, PartOfSpeech, PronounForm, Animateness } from './Dimensions'
import { InflectionForm, InflectionCoordinates } from './InflectionForm'

class Forms {
    allForms: string[] = []

    constructor(public cols: string[], public rows: string[], public forms: any[][]) {
        this.cols = cols
        this.rows = rows
        this.forms = forms

        forms.forEach((line) =>
            line.forEach((form) => {
                if (typeof form == 'object') {
                    this.allForms = this.allForms.concat(form)
                }
                else {
                    this.allForms.push(form)
                }
            }))
    }
    
    formExists(form: string) {
        return this.allForms.indexOf(form) >= 0
    }
}

export let FORMS: { [id: string]: InflectionForm } = {}

function addForm(id: string, name: string, components: InflectionCoordinates) {
    FORMS[id] = new InflectionForm(id, name, components)
}

export let GENDERS: { [id: number] : string } = {}

GENDERS[Gender.M] = 'm'
GENDERS[Gender.F] = 'f'
GENDERS[Gender.N] = 'n'

export let NUMBERS: { [id: number] : string } = {}

NUMBERS[GrammarNumber.SINGULAR] = 'sg'
NUMBERS[GrammarNumber.PLURAL] = 'pl'

export const POSES: { [id: number] : string } = {}

POSES[PartOfSpeech.VERB] = 'v'
POSES[PartOfSpeech.NOUN] = 'n'
POSES[PartOfSpeech.ADJECTIVE] = 'adj'
POSES[PartOfSpeech.ADVERB] = 'adv'
POSES[PartOfSpeech.PRONOUN] = 'pron'
POSES[PartOfSpeech.PREPOSITION] = 'prep'
POSES[PartOfSpeech.NUMBER] = 'num'
POSES[PartOfSpeech.POSSESSIVE] = 'poss'
POSES[PartOfSpeech.PARTICLE] = 'part'
POSES[PartOfSpeech.CONJUNCTION] = 'conj'

export let POS_BY_NAME: { [id: string] : PartOfSpeech } = {}

for (let pos in POSES) {
    POS_BY_NAME[POSES[pos]] = parseInt(pos) as PartOfSpeech
}

export let CASES = {}

CASES[GrammarCase.NOM] = 'nominative'
CASES[GrammarCase.GEN] = 'genitive'
CASES[GrammarCase.DAT] = 'dative'
CASES[GrammarCase.ACC] = 'accusative'
CASES[GrammarCase.INSTR] = 'instrumental'
CASES[GrammarCase.PREP] = 'prepositional'
CASES[GrammarCase.LOC] = 'locative'
CASES[GrammarCase.CONTEXT] = 'context'

addForm('1', 'I', { person: Person.FIRST, number: GrammarNumber.SINGULAR, tense: Tense.PRESENT, pos: PartOfSpeech.VERB }),
addForm('2', 'you', { person: Person.SECOND, number: GrammarNumber.SINGULAR, tense: Tense.PRESENT, pos: PartOfSpeech.VERB }),
addForm('3', 's/he, it', { person: Person.THIRD, number: GrammarNumber.SINGULAR, tense: Tense.PRESENT, pos: PartOfSpeech.VERB }),
addForm('1pl', 'we', { person: Person.FIRST, number: GrammarNumber.PLURAL, tense: Tense.PRESENT, pos: PartOfSpeech.VERB }),
addForm('2pl', 'you (plural)', { person: Person.SECOND, number: GrammarNumber.PLURAL, tense: Tense.PRESENT, pos: PartOfSpeech.VERB }),
addForm('3pl', 'they', { person: Person.THIRD, number: GrammarNumber.PLURAL, tense: Tense.PRESENT, pos: PartOfSpeech.VERB }),
addForm('pastm', 'masculine past', { gender: Gender.M, number: GrammarNumber.SINGULAR, tense: Tense.PAST, pos: PartOfSpeech.VERB })
addForm('pastn', 'neuter past', { gender: Gender.N, number: GrammarNumber.SINGULAR, tense: Tense.PAST, pos: PartOfSpeech.VERB })
addForm('pastf', 'feminine past', { gender: Gender.F, number: GrammarNumber.SINGULAR, tense: Tense.PAST, pos: PartOfSpeech.VERB })
addForm('pastpl', 'past plural', { number: GrammarNumber.PLURAL, tense: Tense.PAST, pos: PartOfSpeech.VERB })
addForm('impr', 'imperative singular', { number: GrammarNumber.SINGULAR, command: Command.IMPERATIVE, pos: PartOfSpeech.VERB })
addForm('imprpl', 'imperative plural', { number: GrammarNumber.PLURAL, command: Command.IMPERATIVE, pos: PartOfSpeech.VERB })
addForm('inf', 'infinitive', { pos: PartOfSpeech.VERB })

addForm('past', 'past', { tense: Tense.PAST, pos: PartOfSpeech.VERB })
addForm('present', 'present', { tense: Tense.PRESENT, pos: PartOfSpeech.VERB })

addForm('m', 'masculine singular', { gender: Gender.M, number: GrammarNumber.SINGULAR, grammaticalCase: GrammarCase.NOM })
addForm('f', 'feminine singular', { gender: Gender.F, number: GrammarNumber.SINGULAR, grammaticalCase: GrammarCase.NOM })
addForm('n', 'neuter singular', { gender: Gender.N, number: GrammarNumber.SINGULAR, grammaticalCase: GrammarCase.NOM })
addForm('pl', 'plural', { number: GrammarNumber.PLURAL, grammaticalCase: GrammarCase.NOM })
addForm('fpl', 'feminine plural', { number: GrammarNumber.PLURAL, gender: Gender.F })
addForm('sg', 'singular', { number: GrammarNumber.SINGULAR })

addForm('nom', 'nominative singular', { grammaticalCase: GrammarCase.NOM, number: GrammarNumber.SINGULAR })
addForm('gen', 'genitive singular', { grammaticalCase: GrammarCase.GEN, number: GrammarNumber.SINGULAR })
addForm('dat', 'dative singular', { grammaticalCase: GrammarCase.DAT, number: GrammarNumber.SINGULAR })
addForm('acc', 'accusative singular', { grammaticalCase: GrammarCase.ACC, number: GrammarNumber.SINGULAR })
addForm('instr', 'instrumental singular', { grammaticalCase: GrammarCase.INSTR, number: GrammarNumber.SINGULAR })
addForm('prep', 'prepositional singular', { grammaticalCase: GrammarCase.PREP, number: GrammarNumber.SINGULAR })
addForm('loc', 'locative singular', { grammaticalCase: GrammarCase.LOC, number: GrammarNumber.SINGULAR })
addForm('locpl', 'locative plural', { grammaticalCase: GrammarCase.LOC, number: GrammarNumber.PLURAL })

// this is a bit of a hack to make it possible select a case independent of number in phrases.
// "gen" should be renamed into "gensg" and "genitive" to "gen" at some point
addForm('nominative', 'nominative', { grammaticalCase: GrammarCase.NOM })
addForm('genitive', 'genitive', { grammaticalCase: GrammarCase.GEN })
addForm('dative', 'dative', { grammaticalCase: GrammarCase.DAT })
addForm('accusative', 'accusative', { grammaticalCase: GrammarCase.ACC })
addForm('instrumental', 'instrumental', { grammaticalCase: GrammarCase.INSTR })
addForm('prepositional', 'prepositional', { grammaticalCase: GrammarCase.PREP })
addForm('locative', 'locative', { grammaticalCase: GrammarCase.LOC })
addForm('imperative', 'imperative', { command: Command.IMPERATIVE })
addForm('masculine', 'masculine', { gender: Gender.M })
addForm('feminine', 'feminine', { gender: Gender.F })
addForm('neuter', 'neuter', { gender: Gender.N })
addForm('plural', 'plural', { number: GrammarNumber.PLURAL })

addForm('context', 'context', { grammaticalCase: GrammarCase.CONTEXT })

addForm('genf', 'genitive feminine', { grammaticalCase: GrammarCase.GEN, number: GrammarNumber.SINGULAR, gender: Gender.F })
addForm('datf', 'dative feminine', { grammaticalCase: GrammarCase.DAT, number: GrammarNumber.SINGULAR, gender: Gender.F })
addForm('accf', 'accusative feminine', { grammaticalCase: GrammarCase.ACC, number: GrammarNumber.SINGULAR, gender: Gender.F })
addForm('instrf', 'instrumental feminine', { grammaticalCase: GrammarCase.INSTR, number: GrammarNumber.SINGULAR, gender: Gender.F })
addForm('prepf', 'prepositional feminine', { grammaticalCase: GrammarCase.PREP, number: GrammarNumber.SINGULAR, gender: Gender.F })

addForm('genn', 'genitive neuter', { grammaticalCase: GrammarCase.GEN, number: GrammarNumber.SINGULAR, gender: Gender.N })
addForm('datn', 'dative neuter', { grammaticalCase: GrammarCase.DAT, number: GrammarNumber.SINGULAR, gender: Gender.N })
addForm('accn', 'accusative neuter', { grammaticalCase: GrammarCase.ACC, number: GrammarNumber.SINGULAR, gender: Gender.N })
addForm('instrn', 'instrumental neuter', { grammaticalCase: GrammarCase.INSTR, number: GrammarNumber.SINGULAR, gender: Gender.N })
addForm('prepn', 'prepositional neuter', { grammaticalCase: GrammarCase.PREP, number: GrammarNumber.SINGULAR, gender: Gender.N })

addForm('genm', 'genitive masculine', { grammaticalCase: GrammarCase.GEN, number: GrammarNumber.SINGULAR, gender: Gender.M })
addForm('datm', 'dative masculine', { grammaticalCase: GrammarCase.DAT, number: GrammarNumber.SINGULAR, gender: Gender.M })
addForm('accanm', 'accusative masculine animate', { grammaticalCase: GrammarCase.ACC, gender: Gender.M, animate: Animateness.ANIMATE, number: GrammarNumber.SINGULAR })
addForm('accinanm', 'accusative masculine inanimate', { grammaticalCase: GrammarCase.ACC, gender: Gender.M, animate: Animateness.INANIMATE, number: GrammarNumber.SINGULAR })
addForm('instrm', 'instrumental masculine', { grammaticalCase: GrammarCase.INSTR, number: GrammarNumber.SINGULAR, gender: Gender.M })
addForm('prepm', 'prepositional masculine', { grammaticalCase: GrammarCase.PREP, number: GrammarNumber.SINGULAR, gender: Gender.M })

addForm('pl', 'nominative plural', { grammaticalCase: GrammarCase.NOM, number: GrammarNumber.PLURAL })
addForm('genpl', 'genitive plural', { grammaticalCase: GrammarCase.GEN, number: GrammarNumber.PLURAL })
addForm('datpl', 'dative plural', { grammaticalCase: GrammarCase.DAT, number: GrammarNumber.PLURAL })
addForm('accpl', 'accusative plural', { grammaticalCase: GrammarCase.ACC, number: GrammarNumber.PLURAL })
addForm('accanpl', 'accusative animate plural', { grammaticalCase: GrammarCase.ACC, animate: Animateness.ANIMATE, number: GrammarNumber.PLURAL })
addForm('accinanpl', 'accusative inanimate plural', { grammaticalCase: GrammarCase.ACC, animate: Animateness.INANIMATE, number: GrammarNumber.PLURAL })
addForm('accinanfpl', 'accusative femininate inanimate plural', { grammaticalCase: GrammarCase.ACC, gender: Gender.F, animate: Animateness.INANIMATE, number: GrammarNumber.PLURAL })

addForm('instrpl', 'instrumental plural', { grammaticalCase: GrammarCase.INSTR, number: GrammarNumber.PLURAL })
addForm('preppl', 'prepositional plural', { grammaticalCase: GrammarCase.PREP, number: GrammarNumber.PLURAL })

addForm('genplalt', 'genitive plural alternative form', { grammaticalCase: GrammarCase.GEN, number: GrammarNumber.PLURAL, pronounForm: PronounForm.ALTERNATIVE })
addForm('datplalt', 'dative plural alternative form', { grammaticalCase: GrammarCase.DAT, number: GrammarNumber.PLURAL, pronounForm: PronounForm.ALTERNATIVE })
addForm('accplalt', 'accusative plural alternative form', { grammaticalCase: GrammarCase.ACC, number: GrammarNumber.PLURAL, pronounForm: PronounForm.ALTERNATIVE })
addForm('instrplalt', 'instrumental plural alternative form', { grammaticalCase: GrammarCase.INSTR, number: GrammarNumber.PLURAL, pronounForm: PronounForm.ALTERNATIVE })
addForm('prepplalt', 'prepositional plural alternative form', { grammaticalCase: GrammarCase.PREP, number: GrammarNumber.PLURAL, pronounForm: PronounForm.ALTERNATIVE })

addForm('genalt', 'genitive plural alternative form', { grammaticalCase: GrammarCase.GEN, number: GrammarNumber.SINGULAR, pronounForm: PronounForm.ALTERNATIVE })
addForm('datalt', 'dative plural alternative form', { grammaticalCase: GrammarCase.DAT, number: GrammarNumber.SINGULAR, pronounForm: PronounForm.ALTERNATIVE })
addForm('accalt', 'accusative plural alternative form', { grammaticalCase: GrammarCase.ACC, number: GrammarNumber.SINGULAR, pronounForm: PronounForm.ALTERNATIVE })
addForm('instralt', 'instrumental plural alternative form', { grammaticalCase: GrammarCase.INSTR, number: GrammarNumber.SINGULAR, pronounForm: PronounForm.ALTERNATIVE })
addForm('prepalt', 'prepositional plural alternative form', { grammaticalCase: GrammarCase.PREP, number: GrammarNumber.SINGULAR, pronounForm: PronounForm.ALTERNATIVE })

addForm('comp', 'comparative', { adjectiveForm: AdjectiveForm.COMPARATIVE })

addForm('shortf', 'short form feminine', { gender: Gender.F, number: GrammarNumber.SINGULAR, adjectiveForm: AdjectiveForm.SHORT })
addForm('shortn', 'short form neuter', { gender: Gender.N, number: GrammarNumber.SINGULAR, adjectiveForm: AdjectiveForm.SHORT })
addForm('shortm', 'short form masculine', { gender: Gender.M, number: GrammarNumber.SINGULAR, adjectiveForm: AdjectiveForm.SHORT })
addForm('shortpl', 'short form plural', { number: GrammarNumber.PLURAL, adjectiveForm: AdjectiveForm.SHORT })
addForm('short', 'short form', { adjectiveForm: AdjectiveForm.SHORT })

addForm('alt', 'alternative form', { pronounForm: PronounForm.ALTERNATIVE })
addForm('alt2', 'alternative form', { pronounForm: PronounForm.ALTERNATIVE })
addForm('std', 'standard form', { pronounForm: PronounForm.STANDARD })

// English forms
addForm('prog', 'progressive', { tense: Tense.PROGRESSIVE })
addForm('pastpart', 'past participle', { tense: Tense.PAST_PARTICIPLE })
addForm('super', 'superlative', { adjectiveForm: AdjectiveForm.SUPERLATIVE })

export function getFormName(formId: string) {    
    let form = FORMS[formId]

    if (form) {
        return form.name
    }
    else {
        console.warn('Unknown form ' + formId + '.')

        return formId
    }
}

export let ENGLISH_FORMS_BY_POS: { [pos: number]: Forms } = { }

ENGLISH_FORMS_BY_POS[PartOfSpeech.VERB] 
    = new Forms([], [], [['3', 'past', 'prog', 'pastpart', 'inf', 'pl', 'pastpl', '1' ]]),
ENGLISH_FORMS_BY_POS[PartOfSpeech.ADJECTIVE] 
    = new Forms([], [], [[ 'comp', 'super', 'pl' ]]),
ENGLISH_FORMS_BY_POS[PartOfSpeech.NOUN] 
    = new Forms([], [], [[ 'pl' ]]),
ENGLISH_FORMS_BY_POS[PartOfSpeech.PRONOUN] 
    = new Forms([], [], [[ 'acc' ]])

export let ENGLISH_FORMS: { [s:string]: InflectionForm } = {}

Object.keys(ENGLISH_FORMS_BY_POS).forEach((pos) => 
    ENGLISH_FORMS_BY_POS[pos].allForms.forEach((form) => {
        if (!FORMS[form]) {
            throw new Error('Need to define form ' + form)
        }

        ENGLISH_FORMS[form] = FORMS[form]
    }))

export let INFLECTION_FORMS : { [pos: number]: Forms } = {}

INFLECTION_FORMS[PartOfSpeech.VERB] =
    new Forms(
        [ 'singular', 'plural' ],
        [ 'inf', '1', '2', '3', 'past', 'imperative'],
        [ ['inf'], ['1', '1pl'], ['2', '2pl'], ['3', '3pl'], 
            [ ['pastm', 'pastn', 'pastf'], 'pastpl' ], [ 'impr', 'imprpl' ] ]
    )

INFLECTION_FORMS[PartOfSpeech.ADJECTIVE] =
    new Forms(
        [ 'masculine singular', 'neuter singular', 'feminine singular', 'plural' ],
        [ 'nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'prepositional', 'short', 'comp' ],
        [
            ['m','n','f','pl'],
            ['genm','genn','genf','genpl'],
            ['datm','datn','datf','datpl'],
            [ [ 'accinanm', 'accanm' ],'accn','accf', [ 'accinanpl', 'accanpl' ]],
            ['instrm','instrn','instrf','instrpl'],
            ['prepm','prepn','prepf','preppl'],
            ['shortm', 'shortn', 'shortf', 'shortpl'],
            ['comp']
        ])

INFLECTION_FORMS[PartOfSpeech.NOUN] =
    new Forms(
        [ 'singular', 'plural' ], 
        [ 'nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'prepositional', 'locative' ],
        [
            ['nom','pl'],
            ['gen','genpl'],
            ['dat','datpl'],
            ['acc','accpl'],
            ['instr','instrpl'],
            ['prep','preppl'],
            ['loc', 'locpl']
        ])

INFLECTION_FORMS[PartOfSpeech.NUMBER] =
    new Forms(
        [ 'masculine singular', 'neuter singular', 'feminine singular', 'plural' ],
        [ 'nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'prepositional' ],
        [
            ['m','n','f', [ 'pl', 'fpl' ]],
            ['genm','genn','genf','genpl'],
            ['datm','datn','datf','datpl'],
            [ [ 'accinanm', 'accanm' ], 'accn', 'accf', [ 'accinanpl', 'accinanfpl', 'accanpl' ]],
            ['instrm','instrn','instrf','instrpl'],
            ['prepm','prepn','prepf','preppl'],
        ]),

INFLECTION_FORMS[PartOfSpeech.PREPOSITION] =
    new Forms(
        [ '' ], 
        [ '' ],
        [ [ 'std', 'alt', 'alt2' ] ]
    )

INFLECTION_FORMS[PartOfSpeech.PRONOUN] =
    new Forms(
        [ 'singular', 'plural' ], 
        [ 'nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'prepositional' ],
        [        
            [ [ 'nom' ], [ 'pl' ]],
            [ [ 'gen', 'genalt'], [ 'genpl', 'genplalt' ]],
            [ [ 'dat', 'datalt'], [ 'datpl', 'datplalt' ]],
            [ [ 'acc', 'accalt'], [ 'accpl', 'accplalt' ]],
            [ [ 'instr', 'instralt'], [ 'instrpl', 'instrplalt' ]],
            [ [ 'prep', 'prepalt'], [ 'preppl', 'prepplalt' ]]
        ])

export function formExists(pos: PartOfSpeech, form: string) {
    let forms = INFLECTION_FORMS[pos]
    
    if (forms) {
        return forms.formExists(form)
    }
    else {
        return false
    }
}

export default FORMS
