
import Match from './Match'

interface EnglishPatternFragment {
    en(match: Match): string
    enWithJpForCases(match: Match, beforeCase?: string, afterCase?: string): string
}

export default EnglishPatternFragment