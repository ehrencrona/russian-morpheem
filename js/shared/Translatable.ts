
interface Translatable {
    getEnglish(form?: string, translationIndex?: number): string
    setEnglish(en?: string, form?: string, translationIndex?: number) 
    toText(): string
}

export default Translatable