
interface Translatable {
    getEnglish(form?: string): string
    setEnglish(en?: string, form?: string) 
    toText(): string
}

export default Translatable