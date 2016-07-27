
import { CaseStudy, Match } from './PhrasePattern'

interface EnglishPatternFragment {
    placeholder: boolean,
    en(match: Match): string
    enWithJpForCases(match: Match): string
}

export default EnglishPatternFragment