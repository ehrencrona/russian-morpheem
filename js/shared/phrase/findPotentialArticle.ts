const ARTICLES = ['a ', 'an ', 'the ']

export default function findPotentialArticle(inEnglishString: string, before: string): string {
    let i = -1
    let foundArticle = false

    inEnglishString = inEnglishString.toLowerCase()

    do {
        i = inEnglishString.indexOf(before, i+1)

        if (i >= 0) {
            let found = ARTICLES.find(article => 
                i - article.length >= 0 
                && inEnglishString.substr(i - article.length, article.length) == article 
                && (i == article.length || inEnglishString[i - article.length-1].match(/\s/)) 
                && before.substr(0, article.length) != article) 
            
            if (found) {
                return found.trim()
            }
        }
    }
    while (i >= 0 && !foundArticle)

    return null
}