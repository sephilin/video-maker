const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')
const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const watsonApiUrl = require('../credentials/watson-nlu.json').url
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
const state = require('./state.js')

const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: watsonApiUrl
});

 const robot = async () => { 
    const content = state.load()

    await fecthContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)

    state.save(content)

    function limitMaximumSentences(content){
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

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

    async function fetchKeywordsOfAllSentences(content){
        for(const sentence of content.sentences){
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)   
        }
    }
    
    async function fetchWatsonAndReturnKeywords (sentence) {
        return new Promise((resolve, reject) => {
            nlu.analyze(
                {
                  text: sentence,
                  features: {               
                    keywords: {}
                  }
                },
                function(error, response) {
                  if (error) {
                    throw error
                  } 
    
                  const keywords = response.keywords.map((keyword) => {
                      return keyword.text
                  })
                 
                  resolve(keywords)
                }
              );
        })
    }
}

module.exports = robot