
export const SKILL_KNEW = 1
export const SKILL_DIDNT_KNOW = -1 
export const SKILL_UNCLEAR = 0

export interface Exposure {
    fact: string
    time: Date
    type: number
    skill: number
    user: number
}

export default Exposure