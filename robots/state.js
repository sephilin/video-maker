const fs = require('fs')
const contentFilePath = './content.json'
const configFilePath = './videoConfig.json'
const subtitleFilePath = './content/subtitle.srt'

const save = (content) => {
    const contentString = JSON.stringify(content)
    return fs.writeFileSync(contentFilePath, contentString)
}

const load = () => {
    const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8')
    const contenJson = JSON.parse(fileBuffer)
    return contenJson
}

const saveVideoConfig = (videoConfig) => {
    const contentString = JSON.stringify(videoConfig)
    return fs.writeFileSync(configFilePath, contentString)
}

const saveVideoSubtitle = (subtitle) => {
    return fs.writeFileSync(subtitleFilePath, subtitle)
}

module.exports = {
    save,
    load,
    saveVideoConfig,
    saveVideoSubtitle
}