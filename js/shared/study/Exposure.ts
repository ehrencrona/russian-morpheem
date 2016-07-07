

export enum Knowledge {
    KNEW = 1, DIDNT_KNOW = 0, MAYBE = -1
}

export enum Skill {
    RECOGNITION = 0,
    PRODUCTION = 1,
    PICKING = 2
}

export interface Exposure {
    fact: string
    time: Date
    skill: Skill
    knew: Knowledge
    user: number
    sentence: number
}

export default Exposure