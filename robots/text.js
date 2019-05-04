const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')
 const robot = async (content) => {
  

    await fecthContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

    console.log(content)

    async function fecthContentFromWikipedia(content){
        const input = {
            "articleName": content.searchTerm,
            "lang": content.languageContent
          };

        const algorithmiaAuthenticated = algorithmia.client(algorithmiaApiKey)
        const wikipediaAlgorithmia = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const wikipediaResponse = await wikipediaAlgorithmia.pipe(input)
        const wikipediaContent = wikipediaResponse.get()         
        content.sourceContentOrignal = wikipediaContent.content
    }

    function sanitizeContent(content){
        const withoutBlanckLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOrignal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlanckLinesAndMarkdown)
           
        content.sourceContentSanitized = withoutDatesInParentheses

        function removeBlankLinesAndMarkdown(text){
            const allLines = text.split('\n')

            const withoutBlanckLinesAndMarkdown = allLines.filter((line) => {
                if(line.trim().length === 0 || line.trim().startsWith('=')){
                    return false
                }                
                return true
            })

            return withoutBlanckLinesAndMarkdown.join(' ')          
        }

        function removeDatesInParentheses(text){
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
    }

    function breakContentIntoSentences(content){
        content.sentences = []
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)

        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }
}

module.exports = robot