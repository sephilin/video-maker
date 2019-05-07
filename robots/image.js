const imageDownloader = require('image-downloader')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')
const fs = require('fs')
const path = require('path')

const googleSearchCredentials = require('../credentials/google-search.json')

const robot = async() => {
    const content = state.load()

    await cleanContentFolder()
    await fetchImagesOfAllSentences(content)
    await downloadAllImages(content)

    state.save(content)

    async function fetchImagesOfAllSentences(content){
        for (const sentence of content.sentences){
            const query = `${content.searchTerm}`
            sentence.images = await fetchGoogleAndReturnImagesLinks(query, sentence.keywords)
            sentence.googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnImagesLinks(query, keywords){
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineId,
            q: query,
            orTerms: keywords.join(' '),
            searchType: 'image',
            num: 2
        })

        const imagesUrl = response.data.items.map((item) => {
            return item.link
        })

        return imagesUrl
    }

    async function downloadAllImages(content){
        content.downloadedImages = []        

        for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++)
        {
            const images = content.sentences[sentenceIndex].images

            for (let imageIndex = 0, imageLength=images.length; imageIndex < imageLength; imageIndex++){
                const imageUrl = images[imageIndex]
                try{
                    if(content.downloadedImages.includes(imageUrl))
                    {
                        throw new Error(`Imagem já foi baixada`)
                    }

                    await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
                    content.downloadedImages.push(imageUrl)
                    console.log(`Baixou imagem com sucesso: ${imageUrl}`)
                    break
                }
                catch(error){
                    console.log(`Erro ao baixar: ${imageUrl} - error: ${error}`)
                }
            }
        }   
    }

    async function cleanContentFolder()
    {
        const directory = './content/'
        try{
            fs.readdir(directory, (error, files) => {
            if (error) throw error
            
            for (const file of files) {
                fs.unlink(path.join(directory, file), error => {
                if (error) throw error
                })
            }
            })
        }
        catch(error){
            console.log(`Erro durante a limpeza da pasta content - erro: ${error}`)
        }
    }

    async function downloadAndSave(url, fileName){
        return imageDownloader.image({
            url, url,
            dest: `./content/${fileName}`
        })
    }
}

module.exports = robot