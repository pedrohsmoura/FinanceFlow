const transactionService = {
    save: function (transaction) {
        return firebase.firestore().collection('transactions').add(transaction);
    },
    update: (transaction) => firebase.firestore().collection("transactions").doc(transaction.uid).update(transaction),
    findByUser: function (user) {
        return firebase.firestore().collection('transactions')
            .where('userId', '==', user.uid)
            .get()
            .then(snapshot => {
                const transactions = [];
                snapshot.forEach(doc => transactions.push({ ...doc.data(), uid: doc.id }));
                return transactions;
            })
            .catch(error => {
                console.error('Erro ao buscar transações por usuário:', error);
                throw error;
            });
    },
    findByUid: function (uid) {
        return firebase.firestore().collection('transactions').doc(uid).get()
            .then(doc => {
                return doc.exists ? { ...doc.data(), uid: doc.id } : null
            })
            .catch(error => {
                console.error('Erro ao buscar transação por UID:', error);
                throw error;
            });
    },
    remove: function (transaction) {
        return firebase.firestore().collection('transactions').doc(transaction.uid).delete()
            .catch(error => {
                console.error('Erro ao remover transação:', error);
                throw error;
            });
    }
};

function saveTransaction() {
    const currency = document.getElementById('currency').value;
    const valueElement = document.getElementById('value');
    const description = document.getElementById('description').value;

    if (!valueElement.value) {
        document.getElementById('value-required-error').style.display = 'block';
        return;
    } else {
        document.getElementById('value-required-error').style.display = 'none';
    }

    if (parseFloat(valueElement.value) <= 0) {
        document.getElementById('value-less-or-equal-to-zero-error').style.display = 'block';
        return;
    } else {
        document.getElementById('value-less-or-equal-to-zero-error').style.display = 'none';
    }

    const transaction = {
        type: 'income',
        description: description,
        date: new Date().toISOString(),
        money: {
            currency: currency,
            value: parseFloat(valueElement.value)
        },
        userId: firebase.auth().currentUser.uid
    };

    showLoading();

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
}

document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
        saveButton.addEventListener('click', saveTransaction);
    } else {
        console.error('Elemento com ID "save-button" não encontrado.');
    }
});