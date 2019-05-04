const fs = require('fs')
const contentFilePath = './content.json'

const save = (content) => {
    const contentString = JSON.stringify(content)
    return fs.writeFileSync(contentFilePath, contentString)
}

const load = () => {
    const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8')
    const contenJson = JSON.parse(fileBuffer)
    return contenJson
}

module.exports = {
    save,
    load
}