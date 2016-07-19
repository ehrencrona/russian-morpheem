import Fact from '../../shared/fact/Fact'
import Tab from '../OpenTab'
import FactComponent from './FactComponent'

export default function openFact(fact: Fact, tab: Tab) {
    tab.openTab(
        <FactComponent fact={ fact } corpus={ this.props.corpus } tab={ this.props.tab }/>,
        fact.toString(),
        fact.getId().toString()
    )
}
