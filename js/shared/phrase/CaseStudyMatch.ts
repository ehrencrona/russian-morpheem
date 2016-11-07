
import { GrammaticalCase } from '../inflection/InflectionForms'
import WordMatch from './WordMatch'

interface CaseStudyMatch extends WordMatch {

    isCaseStudy(): boolean

    getCaseStudied(): GrammaticalCase

}

export default CaseStudyMatch