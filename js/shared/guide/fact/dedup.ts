import Fact from '../../fact/Fact';

export default function dedup(facts: Fact[]) {
    let seen = {}

    return facts.filter(fact => {
        if (!fact) {
            return false
        }

        let result = !seen[fact.getId()]

        seen[fact.getId()] = true
        
        return result
    })
}
