// Require a logged-in user
const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

if (!loggedInUser) {
    window.location.href = "login.html";
} else {
    document.getElementById("userName").textContent = loggedInUser.name;
}

// Logout
document.getElementById("logoutButton").addEventListener("click", function () {
    sessionStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
});

// Use the existing "expenses" key so previously saved expense records remain.
let transactions = JSON.parse(localStorage.getItem("expenses")) || [];

const transactionForm = document.getElementById("expenseForm");

document.getElementById('typeFilter').addEventListener('change', displayTransactions);
document.getElementById('categoryFilter').addEventListener('change', displayTransactions);

transactionForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const transaction = {
        id: Date.now(),
        userId: loggedInUser.id,
        name: document.getElementById("expenseName").value.trim(),
        type: document.getElementById("transactionType").value,
        amount: Number(document.getElementById("amount").value),
        category: document.getElementById("category").value,
        date: document.getElementById("date").value
    };

    if (!transaction.name || transaction.amount <= 0 || !transaction.date) {
        return;
    }

    transactions.push(transaction);
    saveTransactions();
    transactionForm.reset();
    displayTransactions();
});

function saveTransactions() {
    localStorage.setItem("expenses", JSON.stringify(transactions));
}

function displayTransactions() {
    const tableBody = document.getElementById("expenseTableBody");
    const typeFilter = document.getElementById("typeFilter").value;
    const categoryFilter = document.getElementById("categoryFilter").value;

    const userTransactions = transactions.filter(function (transaction) {
        const type = transaction.type === "income" ? "income" : "expense";
        const matchesUser = transaction.userId === loggedInUser.id;
        const matchesType = typeFilter === "all" || type === typeFilter;
        const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;

        return matchesUser && matchesType && matchesCategory;
    });

    tableBody.innerHTML = "";

    if (userTransactions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">No transactions found.</td>
            </tr>
        `;
        updateSummary(userTransactions);
        return;
    }

    userTransactions
        .slice()
        .sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        })
        .forEach(function (transaction) {
            // Old records have no type, so treat them as expenses.
            const type = transaction.type === "income" ? "income" : "expense";
            const row = document.createElement("tr");

            [
                transaction.name,
                type.charAt(0).toUpperCase() + type.slice(1),
                `₹${Number(transaction.amount).toFixed(2)}`,
                transaction.category,
                transaction.date
            ].forEach(function (value, index) {
                const cell = document.createElement("td");
                cell.textContent = value;

                if (index === 1) {
                    cell.className = `transaction-${type}`;
                }

                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", function () {
                deleteTransaction(transaction.id);
            });
            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);
            tableBody.appendChild(row);
        });

    updateSummary(userTransactions);
}

function updateSummary(userTransactions) {
    let totalIncome = 0;
    let totalExpenses = 0;

    userTransactions.forEach(function (transaction) {
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "income") {
            totalIncome += amount;
        } else {
            // Records created before transaction types were added are expenses.
            totalExpenses += amount;
        }
    });

    document.getElementById("totalIncome").textContent = totalIncome.toFixed(2);
    document.getElementById("totalAmount").textContent = totalExpenses.toFixed(2);
    document.getElementById("balance").textContent =
        (totalIncome - totalExpenses).toFixed(2);
    document.getElementById("totalTransactions").textContent =
        userTransactions.length;
}

function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) {
        return;
    }

    transactions = transactions.filter(function (transaction) {
        return transaction.id !== id;
    });

    saveTransactions();
    displayTransactions();
}

displayTransactions();

