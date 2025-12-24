import streamlit as st
import sqlite3
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime

# ---------------- CONFIG ----------------
st.set_page_config(page_title="Personal Expense Tracker", layout="wide")

# ---------------- DATABASE ----------------
conn = sqlite3.connect("expenses.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    category TEXT,
    amount REAL,
    type TEXT,
    note TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS budgets (
    category TEXT PRIMARY KEY,
    limit_amount REAL
)
""")

conn.commit()

# ---------------- FUNCTIONS ----------------
def add_record(date, category, amount, type_, note):
    cursor.execute(
        "INSERT INTO expenses (date, category, amount, type, note) VALUES (?, ?, ?, ?, ?)",
        (date, category, amount, type_, note)
    )
    conn.commit()

def load_data():
    return pd.read_sql("SELECT * FROM expenses", conn)

def load_budgets():
    return pd.read_sql("SELECT * FROM budgets", conn)

# ---------------- SIDEBAR ----------------
st.sidebar.title("💰 Expense Tracker")

menu = st.sidebar.radio(
    "Navigation",
    ["Dashboard", "Add Expense", "Budgets"]
)

# ---------------- DASHBOARD ----------------
if menu == "Dashboard":
    st.title("📊 Personal Expense Dashboard")

    df = load_data()

    if df.empty:
        st.warning("No data available. Add expenses first.")
    else:
        df["date"] = pd.to_datetime(df["date"])

        income = df[df["type"] == "Income"]["amount"].sum()
        expense = df[df["type"] == "Expense"]["amount"].sum()
        balance = income - expense

        col1, col2, col3 = st.columns(3)
        col1.metric("Total Income", f"₹ {income:,.2f}")
        col2.metric("Total Expenses", f"₹ {expense:,.2f}")
        col3.metric("Balance", f"₹ {balance:,.2f}")

        st.divider()

        col4, col5 = st.columns(2)

        # Pie Chart
        with col4:
            st.subheader("📌 Category-wise Expenses")
            exp_df = df[df["type"] == "Expense"]
            cat_data = exp_df.groupby("category")["amount"].sum()
            fig1, ax1 = plt.subplots()
            ax1.pie(cat_data, labels=cat_data.index, autopct="%1.1f%%")
            st.pyplot(fig1)

        # Line Chart
        with col5:
            st.subheader("📈 Monthly Expense Trend")
            monthly = exp_df.groupby(exp_df["date"].dt.to_period("M"))["amount"].sum()
            monthly.index = monthly.index.astype(str)
            fig2, ax2 = plt.subplots()
            ax2.plot(monthly.index, monthly.values, marker="o")
            ax2.set_xlabel("Month")
            ax2.set_ylabel("Amount")
            st.pyplot(fig2)

        st.divider()

        st.subheader("📋 Expense Records")
        st.dataframe(df.sort_values("date", ascending=False), use_container_width=True)

# ---------------- ADD EXPENSE ----------------
elif menu == "Add Expense":
    st.title("➕ Add Income / Expense")

    with st.form("expense_form"):
        date = st.date_input("Date", datetime.today())
        category = st.selectbox(
            "Category",
            ["Food", "Rent", "Travel", "Shopping", "Bills", "Entertainment", "Other"]
        )
        amount = st.number_input("Amount", min_value=0.0, step=100.0)
        type_ = st.radio("Type", ["Expense", "Income"])
        note = st.text_input("Note")

        submitted = st.form_submit_button("Add Record")

        if submitted:
            add_record(str(date), category, amount, type_, note)
            st.success("Record added successfully!")

# ---------------- BUDGETS ----------------
elif menu == "Budgets":
    st.title("🎯 Budget Management")

    budgets_df = load_budgets()

    with st.form("budget_form"):
        category = st.selectbox(
            "Category",
            ["Food", "Rent", "Travel", "Shopping", "Bills", "Entertainment", "Other"]
        )
        limit_amount = st.number_input("Monthly Budget", min_value=0.0, step=500.0)
        submit_budget = st.form_submit_button("Set Budget")

        if submit_budget:
            cursor.execute(
                "INSERT OR REPLACE INTO budgets (category, limit_amount) VALUES (?, ?)",
                (category, limit_amount)
            )
            conn.commit()
            st.success("Budget saved!")

    st.divider()

    st.subheader("📊 Budget Status")

    df = load_data()
    exp_df = df[df["type"] == "Expense"]
    budgets_df = load_budgets()

    if not budgets_df.empty:
        for _, row in budgets_df.iterrows():
            spent = exp_df[exp_df["category"] == row["category"]]["amount"].sum()
            percent = min(spent / row["limit_amount"], 1.0)

            st.write(f"**{row['category']}** — ₹{spent:.2f} / ₹{row['limit_amount']:.2f}")
            st.progress(percent)

            if spent > row["limit_amount"]:
                st.error("⚠ Budget Exceeded!")
            elif spent > 0.8 * row["limit_amount"]:
                st.warning("⚠ Near Budget Limit")

    else:
        st.info("No budgets set yet.")

# ---------------- FOOTER ----------------
st.sidebar.markdown("---")
st.sidebar.info("📌 Streamlit Expense Tracker\n\nBuilt for academic & real-world use")
