const Modal = {
    open(){
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}


const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finance:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finance:transactions", JSON.stringify(transactions) )
    }
}

const Transaction = {

    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes(){
        let income = 0

        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0){
                income += transaction.amount;
            }
        })
        return income
    },
    expensives(){
        let expense = 0
    
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0){
                expense += transaction.amount;
            }
        })
        return expense

    },
    total(){
        let total = 0

        Transaction.all.forEach(transaction => {
           total += transaction.amount 
        })
        return total
    }
}

const Utils = {

    formatAmount(amount){
        amount = Number(amount) * 100
        return Math.round(amount)
    },

    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("PT-BR",{ 
            style: "currency",
            currency: "BRL"
         })

        return signal + value
    }
}

const DOM = {

    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    
    innerHTMLTransaction(transaction, index){
        const CssClass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <tr>
        <td class="description">${transaction.description}</td>
        <td class="${CssClass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onClick="Transaction.remove(${index})" src="./assets/minus.svg">
        </td>
        </tr> `

        return html
    },

    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes()),
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expensives()),
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){
        const {description, date, amount} = Form.getValues() 
        if(description.trim() == '' || date.trim() == '' || amount.trim() == ''){
            throw new Error("Por favor, preencha todos os campos!")
        }
    },

    formatValues(){
        let  {description, amount, date} = Form.getValues()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return{
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.date.value = ""
        Form.description.value = ""
        Form.amount.value = ""
    },

    submit(event){
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()

        } catch (error) {
            
            alert(error.message)
        }
    }
}

App = {
    init(){
        Transaction.all.forEach((transaction, index) => { 
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransactions(),
        App.init()
    }
}

App.init()
