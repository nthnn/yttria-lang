export default interface ProjectStructure {
    name: string,
    description: string,
    authors: Array<string>,
    version: string,
    url: string,
    sourceFolder: string,
    outputFolder: string,
    target: string
}