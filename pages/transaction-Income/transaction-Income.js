if (!isNewTransaction()) {
    const uid = getTransactionUid();
    findTransactionByUid(uid);
}

function getTransactionUid() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('uid');
}

function isNewTransaction() {
    return getTransactionUid() ? false : true;
}

function findTransactionByUid(uid) {
    showLoading();

    transactionService.findByUid(uid)
        .then(transaction => {
            hideLoading();
            if (transaction) {
                fillTransactionScreen(transaction);
                toggleSaveButtonDisable();
            } else {
                alert("Documento nao encontrado");
                window.location.href = "../home/home.html";
            }
        })
        .catch(() => {
            hideLoading();
            alert("Erro ao recuperar documento");
            window.location.href = "../home/home.html";
        });
}

function formatDate(timestamp) {
    var date = new Date(timestamp),
        day = (date.getDate() + 1).toString(),
        finalDay = (day.length == 1) ? '0' + day : day,
        month = (date.getMonth() + 1).toString(),
        finalMonth = (month.length == 1) ? '0' + month : month,
        finalYear = date.getFullYear();
    return finalYear + "-" + finalMonth + "-" + finalDay;
}

function fillTransactionScreen(transaction) {
    if (transaction.type == "expense") {
        form.typeExpense().checked = true;
    } else {
        form.typeIncome().checked = true;
    }

    form.date().value = formatDate(transaction.date);
    form.currency().value = transaction.money.currency;
    form.value().value = transaction.money.value;
    form.transactionType().value = transaction.detail;

    if (transaction.description) {
        form.description().value = transaction.description;
    }
}

function saveTransaction() {
    const currency = form.currency().value;
    const valueElement = form.value();
    const description = form.description().value;
    const transactionType = form.transactionType().value;

    if (!valueElement.value) {
        form.valueRequiredError().style.display = 'block';
        return;
    } else {
        form.valueRequiredError().style.display = 'none';
    }

    if (parseFloat(valueElement.value) <= 0) {
        form.valueLessOrEqualToZeroError().style.display = 'block';
        return;
    } else {
        form.valueLessOrEqualToZeroError().style.display = 'none';
    }

    const transaction = {
        type: 'income',
        description: description,
        date: form.date().value,
        money: {
            currency: currency,
            value: parseFloat(valueElement.value)
        },
        detail: transactionType,
        userId: firebase.auth().currentUser.uid,
        uid: getTransactionUid()
    };

    showLoading();

    if (isNewTransaction()) {
        transactionService.save(transaction)
            .then(() => {
                hideLoading();
                alert('Transação salva com sucesso!');
                window.location.href = "../home/home.html";
            })
            .catch(error => {
                hideLoading();
                console.error('Erro ao salvar transação:', error);
                alert('Erro ao salvar transação');
            });
    } else {
        transactionService.update(transaction)
            .then(() => {
                hideLoading();
                alert('Transação alterada com sucesso!');
                window.location.href = "../home/home.html";
            })
            .catch(error => {
                hideLoading();
                console.error('Erro ao alterar transação:', error);
                alert('Erro ao alterar transação');
            });
    }
}

function save(transaction) {
    showLoading();

    transactionService.save(transaction)
        .then(() => {
            hideLoading();
            window.location.href = "../home/home.html";
        })
        .catch(() => {
            hideLoading();
            alert('Erro ao salvar transaçao');
        })
}

function update(transaction) {
    showLoading();
    transactionService.update(transaction)
        .then(() => {
            hideLoading();
            window.location.href = "../home/home.html";
        })
        .catch(() => {
            hideLoading();
            alert('Erro ao atualizar transaçao');
        });
}

function createTransaction() {
    return {
        type: form.typeExpense().checked ? "expense" : "income",
        date: form.date().value,
        money: {
            currency: form.currency().value,
            value: parseFloat(form.value().value)
        },
        transactionType: form.transactionType().value,
        description: form.description().value,
        user: {
            uid: firebase.auth().currentUser.uid
        }
    };
}

function onChangeDate() {
    const date = form.date().value;
    form.dateRequiredError().style.display = !date ? "block" : "none";

    toggleSaveButtonDisable();
}

function onChangeValue() {
    const value = form.value().value;
    form.valueRequiredError().style.display = !value ? "block" : "none";

    form.valueLessOrEqualToZeroError().style.display = value <= 0 ? "block" : "none";

    toggleSaveButtonDisable();
}

function onChangeTransactionType() {
    const transactionType = form.transactionType().value;
    form.transactionTypeRequiredError().style.display = !transactionType ? "block" : "none";

    toggleSaveButtonDisable();
}

function toggleSaveButtonDisable() {
    form.saveButton().disabled = !isFormValid();
}

function isFormValid() {
    const date = form.date().value;
    if (!date) {
        return false;
    }

    const value = form.value().value;
    if (!value || value <= 0) {
        return false;
    }

    const transactionType = form.transactionType().value;
    if (!transactionType) {
        return false;
    }

    return true;
}

function cancel() {
    window.location.href = "../home/home.html";
}

const form = {
    currency: () => document.getElementById('currency'),
    date: () => document.getElementById('date'),
    description: () => document.getElementById('description'),
    dateRequiredError: () => document.getElementById('date-required-error'),
    saveButton: () => document.getElementById('save-button'),
    transactionType: () => document.getElementById('transaction-type'),
    transactionTypeRequiredError: () => document.getElementById('transaction-type-required-error'),
    typeExpense: () => document.getElementById('transaction-type'),
    typeIncome: () => document.getElementById('transaction-type'),
    value: () => document.getElementById('value'),
    valueRequiredError: () => document.getElementById('value-required-error'),
    valueLessOrEqualToZeroError: () => document.getElementById('value-less-or-equal-to-zero-error')
}

document.addEventListener('DOMContentLoaded', () => {
    const saveButton = form.saveButton();
    if (saveButton) {
        saveButton.addEventListener('click', saveTransaction);
    } else {
        console.error('Elemento com ID "save-button" não encontrado.');
    }
});