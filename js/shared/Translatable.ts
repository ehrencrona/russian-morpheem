
interface Translatable {
    getEnglish(form?: string): string
    setEnglish(en?: string, form?: string, translationIndex?: number) 
    toText(): string
}

export default Translatable