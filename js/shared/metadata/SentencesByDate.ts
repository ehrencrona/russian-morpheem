
export interface SentencesByAuthor {
    [ author : string ]: number
}

export interface SentencesByDate {
    values: SentencesByAuthor[],
    authors: string[],
    days: number[]
}