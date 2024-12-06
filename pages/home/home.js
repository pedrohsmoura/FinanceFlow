function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "../../index.html";
    }).catch(() => {
        alert('Erro ao fazer logout');
    })
}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        findTransactions(user);
    }
})

function newExpense() {
    window.location.href = "../transaction-Expense/transaction-Expense.html";
}

function newIncome() {
    window.location.href = "../transaction-Income/transaction-Income.html";
}

function findTransactions(user) {
    showLoading();
    transactionService.findByUser(user)
        .then(transactions => {
            hideLoading();
            addTransactionsToScreen(transactions);
        })
        .catch(error => {
            hideLoading();
            alert('Erro ao recuperar transacoes');
        })
}

function addTransactionsToScreen(transactions) {
    const orderedList = document.getElementById('transactions');

    transactions.forEach(transaction => {
        const li = createTransactionListItem(transaction);
        li.appendChild(createDeleteButton(transaction));

        li.appendChild(createParagraphWithTitle('Data: ', formatDate(transaction.date)));
        
        li.appendChild(createParagraphWithTitle('Valor: ', formatMoney(transaction.money)));
        
        li.appendChild(createParagraphWithTitle('Tipo: ', transaction.detail));
        
        if (transaction.description) {
            li.appendChild(createParagraphWithTitle('Descrição: ', transaction.description));
        }

        orderedList.appendChild(li);
    });
}

function createParagraphWithTitle(title, content) {
    const paragraph = document.createElement('p');
    paragraph.innerHTML = `<strong>${title}</strong> ${content}`;
    return paragraph;
}

function createTransactionListItem(transaction) {
    const li = document.createElement('li');
    li.classList.add(transaction.type);
    li.id = transaction.uid;
    li.addEventListener('click', () => {
        if (transaction.type === 'expense') {
            window.location.href = " ../transaction-Expense/transaction-Expense.html?uid=" + transaction.uid;
        } else {
            window.location.href = "../transaction-Income/transaction-Income.html?uid=" + transaction.uid;
        }
    });
    return li;
}

function createDeleteButton(transaction) {
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = "Remover";
    deleteButton.classList.add('outline', 'danger');
    deleteButton.addEventListener('click', event => {
        event.stopPropagation();
        askRemoveTransaction(transaction);
    })
    return deleteButton;
}

function createParagraph(value) {
    const element = document.createElement('p');
    element.innerHTML = value;
    return element;
}

function askRemoveTransaction(transaction) {
    const shouldRemove = confirm('Deseja remover a transaçao?');
    if (shouldRemove) {
        removeTransaction(transaction);
    }
}

function removeTransaction(transaction) {
    showLoading();

    transactionService.remove(transaction)
        .then(() => {
            hideLoading();
            document.getElementById(transaction.uid).remove();
        })
        .catch(error => {
            hideLoading();
            alert('Erro ao remover transaçao');
        })
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-br', {timeZone: 'UTC'});
}

function formatMoney(money) {
    return `${money.currency} ${money.value.toFixed(2)}`
}

document.addEventListener('DOMContentLoaded', () => {
    const addEntryButton = document.getElementById('add-entry-button');
    if (addEntryButton) {
        addEntryButton.addEventListener('click', () => {
            addEntry();
        });
    } else {
        console.error('Elemento com ID "add-entry-button" não encontrado.');
    }

    const addIncomeButton = document.getElementById('add-income-button');
    if (addIncomeButton) {
        addIncomeButton.addEventListener('click', () => {
            newIncome();
        });
    } else {
        console.error('Elemento com ID "add-income-button" não encontrado.');
    }
});
