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
        </tr>`;
    });

    document.getElementById("table").innerHTML = html;
}

// Add new expense
document.getElementById("addForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;

    await fetch(API + "/expenses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            title,
            amount,
            date: new Date().toISOString()
        })
    });

    document.getElementById("addForm").reset();
    loadExpenses();
});

// Logout
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}
