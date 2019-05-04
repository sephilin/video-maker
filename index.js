const readline = require('readline-sync')
const robots = {
    text: require('./robots/text.js')
}

 const start = async () => {
    const content = {
        searchTerm: "",
        prefix: "",
        sourceContentOrignal: "",
        sourceContentSanitized: "",
        sentences: [
            {
                text:"",
                keywords: [""],
                images: [""]
            }
        ]
    }

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()

    await robots.text(content)

    function askAndReturnSearchTerm(){
        return readline.question('Escreva o termo buscado no Wikipedia: ')
    }

    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of' ]
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Escolha uma opcao: ')       
        return prefixes[selectedPrefixIndex]
    }
    //console.log(content)
}

start()