const readline = require('readline-sync')
const state = require('./state.js')

const robot = async () => {
    const content = {
        maximumSentences: 7        
    }
        
    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    content.languageContent = askAndReturnLanguage()
    state.save(content)

    function askAndReturnSearchTerm(){
        return readline.question('Escreva o termo buscado no Wikipedia: ')
    }

    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of' ]
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Escolha uma opcao: ')       
        return prefixes[selectedPrefixIndex]
    }

    function askAndReturnLanguage(){
        const prefixes = ['en', 'pt-br', 'fr' ]
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Escolha a linguagem: ')       
        return prefixes[selectedPrefixIndex]
    }
}

module.exports = robot


// const content = {
    //     searchTerm: "",
    //     languageContent: "",
    //     prefix: "",
    //     sourceContentOrignal: "",
    //     sourceContentSanitized: "",
    //     sentences: [
    //         {
    //             text:"",
    //             keywords: [""],
    //             images: [""]
    //         }
    //     ]
    // }
