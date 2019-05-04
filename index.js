const readline = require('readline-sync')

const start = () => {
    const content = {}

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()

    function askAndReturnSearchTerm(){
        return readline.question('Escreva o termo buscado no Wikipedia: ')
    }

    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of' ]
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Escolha uma opcao: ')       
        return prefixes[selectedPrefixIndex]
    }

    console.log(content);
}

start()