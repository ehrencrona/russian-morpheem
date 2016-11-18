

export enum PartOfSpeech {
    NOUN = 1,
    VERB,
    ADJECTIVE,
    ADVERB,
    PRONOUN,
    PREPOSITION,
    POSSESSIVE,
    NUMBER,
    PARTICLE,
    QUESTION,
    CONJUNCTION
}

export enum Gender {
    M = 1, N, F
}

export enum Aspect {
    IMPERFECTIVE = 1, PERFECTIVE 
}

export enum Tense {
    PRESENT = 1, PAST, PROGRESSIVE, PAST_PARTICIPLE
}

export enum GrammarCase {
    CONTEXT = 1, NOM, GEN, DAT, ACC, INSTR, PREP, LOC
}

export enum Person {
    FIRST = 1, SECOND, THIRD
}

export enum Animateness {
    INANIMATE = 1, ANIMATE
}

export enum GrammarNumber {
    SINGULAR = 1, PLURAL
}

export enum Command {
    NORMAL = 1, IMPERATIVE
}

export enum AdjectiveForm {
    NORMAL = 1, SHORT, COMPARATIVE, SUPERLATIVE
}

export enum Reflexivity {
    NON_REFLEXIVE = 1, REFLEXIVE
}

export enum Negation {
    POSITIVE = 1, NEGATIVE 
}

export enum PronounForm {
    STANDARD = 1,
    ALTERNATIVE
}

export enum Cardinality {
    CARDINAL = 1,
    ORDINAL
}
