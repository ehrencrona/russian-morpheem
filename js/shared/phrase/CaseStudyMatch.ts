
import { GrammaticalCase } from '../inflection/InflectionForms'

interface CaseStudyMatch {

    isCaseStudy(): boolean

    getCaseStudied(): GrammaticalCase

}

export default CaseStudyMatch