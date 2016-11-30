import { MatchContext, DebugPosition } from '../../shared/phrase/MatchContext';

export default class PhraseDebugger {
    root: DebugNode = new DebugNode(null)
    at: DebugNode

    constructor() {
        this.at = this.root
    }

    debug() {
        let atId = 0

        return (message: string, position: DebugPosition) => {
            if (position == DebugPosition.START) {
                let node = new DebugNode(this.at)

                node.id = atId++
                node.startMessage = message

                this.at.children.push(node)
                this.at = node
            }
            else {
                this.at.endMessage = message
                this.at = this.at.parent
            }
        }
    }
}

export class DebugNode {
    children: DebugNode[] = []
    startMessage: string
    endMessage: string
    id: number

    constructor(public parent: DebugNode) {
    }
}