import TabSetComponent from './TabSetComponent';

export default class Tab {
    scrollTop: number
    state: any
    
    constructor(public name: string, public id: string, public component: any, public tabSet: TabSetComponent) {
        this.name = (name.length > 30 ? name.substr(0, 30) + '...' : name)
        this.id = id
        this.component = component
        this.tabSet = tabSet
    }

    openTab(element, name:string, id: string) {
        this.tabSet.openTab(element, name, id, this) 
    }

    close() {
        this.tabSet.closeTab(this)
    }

    getLastTabIds() {
        return this.tabSet.getLastTabIds()
    }
}
