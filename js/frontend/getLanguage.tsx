
export default function getLanguage() {
    let lang = 'ru'

    if (localStorage.getItem('lang')) {
        lang = localStorage.getItem('lang')
    }

    if (document.location.hostname.indexOf('latin') > 0) {
        lang = 'lat'
    }
    
    return lang
}
