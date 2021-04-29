const Modal = {
    open() {
        // abrir modal
        //adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
    },
    close() {
        //fechar o modal
        //remover a class active no modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
        
    }
}

// SALVAR AS MUDANÇAS FEITAS NO PROGRAMA NO LOCALSTORAGE
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [] 
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) // transforma o array em string
    }
}

// ENTRADAS, SAÍDAS, TOTAL E FUNÇÕES
const Transaction = {
    all: Storage.get(),
    
    /* array removido para a funcionalidade do storage entrar
    [
        {
            description: 'Cliente 1',
            amount: -300000,
            date: '23/03/2021'
        },
        {
            description: 'Cliente 2',
            amount: 500000,
            date: '27/03/2021'
        }, 
        { 
            description: 'Cliente 3',
            amount: -200000,
            date: '20/03/2021'
        },
        { 
            description: 'Cliente 4',
            amount: 70000,
            date: '24/03/2021'
        }
    ],*/

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes () {
        let income = 0;

        // pegar todas as transações
        // para cada transação
        Transaction.all.forEach(transaction => { //arrow function
            // se ela for maior que zero
            if( transaction.amount > 0 ) {
                // somar a uma variável e retornar a variável
                income += transaction.amount;
            }

        })
        return income 
    },

    expenses() {
        let expense = 0;
    
        Transaction.all.forEach(transaction => { 
            if( transaction.amount < 0 ) {
                expense += transaction.amount;
            }
        })

        return expense
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

//Substituir os dados do HTML com os dados do JS
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index) // index = indica a posição do item excluido
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount =  Utils.formatCurrency(transaction.amount)

        const html = 
        `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
        </td>
        `

        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())

        document.getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document.getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    // LIMPAR
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

//Sinal -
// replace global >> /valor/g
const Utils = {
    formatAmount(value) {
        value = value * 100

        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        }) 

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    // CASO ALGUM CAMPO NÃO SEJA PREENCHIDO
    validateFields() {
        const { description, amount, date } = Form.getValues()
        
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos") // mensagem de campo "vazio"
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
        
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            // verificar informações preenchidas
            Form.validateFields()
            // formatar para salvar
            const transaction = Form.formatValues()
            // salvar
            Transaction.add(transaction)
            // apagar os dados
            Form.clearFields()
            // fechar o modal
            Modal.close()
            // atualizar o app

        } catch (error) {
            alert(error.message)
        }
        
    }
}

// Fluxo da aplicação
const App = {
    init() {
        // adiciona todos os arrays para o HTML
        // POPULOU - PASSO 2 
        // POPULOU NOVAMENTE APÓS A SEGUNDA INICIALIZAÇÃO - PASSO 4
        Transaction.all.forEach(function(transaction, index) {
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()

        Storage.set(Transaction.all) //guarda os dados
    },

    reload() {
        DOM.clearTransactions()
        App.init() // INICIOU NOVAMENTE - PASSO 3
    },
}

App.init() // INICIOU - PASSO 1


