const API = "http://localhost:5000";
const token = localStorage.getItem("token");

// Protect dashboard
if (!token) {
    alert("Please login first");
    window.location.href = "index.html";
}

// Load expenses on page load
window.onload = loadExpenses;

// Fetch and display expenses
async function loadExpenses() {
    const res = await fetch(API + "/expenses", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();

    let html = "";
    data.forEach(e => {
        html += `<tr>
            <td>${e.title}</td>
            <td>${e.amount}</td>
            <td>${new Date(e.date).toLocaleDateString()}</td>
            <td>
                <button onclick="editExpense('${e._id}')">Edit</button>
                <button onclick="deleteExpense('${e._id}')">Delete</button>
            </td>
        </tr>`;
    });

    document.getElementById("table").innerHTML = html;
}

// Add new expense (FIXED DATE HANDLING)
document.getElementById("addForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;
    const dateValue = document.getElementById("date").value; // YYYY-MM-DD

    await fetch(API + "/expenses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            title,
            amount,
            date: new Date(dateValue) // ✅ USE USER-SELECTED DATE
        })
    });

    document.getElementById("addForm").reset();
    loadExpenses();
});

// Delete expense
async function deleteExpense(id) {
    const confirmDelete = confirm("Are you sure you want to delete this expense?");
    if (!confirmDelete) return;

    await fetch(API + "/expenses/" + id, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    loadExpenses();
}

// Edit expense (WORKING VERSION)
async function editExpense(id) {
    // Get all expenses
    const res = await fetch(API + "/expenses", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const expenses = await res.json();
    const expense = expenses.find(e => e._id === id);

    if (!expense) {
        alert("Expense not found");
        return;
    }

    const newTitle = prompt("Edit title:", expense.title);
    if (newTitle === null || newTitle.trim() === "") return;

    const newAmount = prompt("Edit amount:", expense.amount);
    if (newAmount === null || newAmount.trim() === "") return;

    await fetch(API + "/expenses/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            title: newTitle,
            amount: newAmount
        })
    });

    loadExpenses();
}

// Logout
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}
