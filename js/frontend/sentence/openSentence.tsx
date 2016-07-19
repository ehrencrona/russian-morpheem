import Sentence from '../../shared/Sentence'
import Tab from '../OpenTab'
import SentenceComponent from '../SentenceComponent'

export default function openSentence(sentence: Sentence, tab: Tab) {
    tab.openTab(
        <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ this.props.tab }/>,
        sentence.toString(),
        sentence.getId().toString()
    )
}
