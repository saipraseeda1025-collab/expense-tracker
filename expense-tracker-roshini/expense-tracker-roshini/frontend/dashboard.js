const token = localStorage.getItem("token");
const API = "http://localhost:5000";

async function loadExpenses() {
    const res = await fetch(API + "/expenses", {
        headers: { "Authorization": token }
    });
    const data = await res.json();

    let html = "<tr><th>Title</th><th>Amount</th><th>Category</th></tr>";
    data.forEach(e => {
        html += `<tr>
            <td>${e.title}</td>
            <td>${e.amount}</td>
            <td>${e.category}</td>
        </tr>`;
    });
    document.getElementById("table").innerHTML = html;
}

document.getElementById("addForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    await fetch(API + "/expenses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify({
            title: title.value,
            amount: amount.value,
            category: category.value
        })
    });

    loadExpenses();
});
loadExpenses();

