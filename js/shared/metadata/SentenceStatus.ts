export interface SentenceStatus {
    author?: string,
    status: number,
    sentence?: number,
    source?: string,
    externalId?: number
}

export const STATUS_DELETED = -1
export const STATUS_SUBMITTED = 0
export const STATUS_ACCEPTED = 10
