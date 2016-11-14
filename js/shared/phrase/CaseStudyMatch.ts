
import { GrammarCase } from '../inflection/Dimensions'
import WordMatch from './WordMatch'

interface CaseStudyMatch extends WordMatch {

    isCaseStudy(): boolean

    getCaseStudied(): GrammarCase

}

export default CaseStudyMatch