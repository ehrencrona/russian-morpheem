interface OpenTab {
    openTab(element, name:string, id: string)
    close()
    getLastTabIds(): string[]
}

export default OpenTab