
import { CaseStudy, Match } from './PhrasePattern'

interface EnglishPatternFragment {
    placeholder: boolean,
    placeholderOverrideForm: string,
    en(match: Match): string
    enWithJpForCases(match: Match): string
}

export default EnglishPatternFragment