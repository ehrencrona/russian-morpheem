export interface PhraseStatus {
    status?: number,
    phrase?: string,
    author?: string,
    notes?: string
}

export const STATUS_OPEN = 0
export const STATUS_CLOSED = 10
