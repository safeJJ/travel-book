"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import styles from "./page.module.css";

type TransactionType = "income" | "expense";
type Transaction = {
  id: number;
  type: TransactionType;
  title: string;
  amount: number;
  author: string;
};

const STORAGE_KEY = "travel-book-fund-transactions";

const initialTransactions: Transaction[] = [
  { id: 1, type: "income", title: "เงินกองกลางรอบแรก", amount: 20000, author: "SafeJJ" },
  { id: 2, type: "expense", title: "ค่าที่พัก 2 คืน", amount: 6000, author: "เมย์" },
  { id: 3, type: "expense", title: "ค่าเช่ารถ", amount: 2500, author: "เมย์" },
  { id: 4, type: "expense", title: "อาหารกลางวัน", amount: 1200, author: "เมย์" }
];

function loadTransactions() {
  if (typeof window === "undefined") return initialTransactions;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialTransactions;
  try {
    return JSON.parse(raw) as Transaction[];
  } catch {
    return initialTransactions;
  }
}

export default function FundManagerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [type, setType] = useState<TransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [manager, setManager] = useState("เมย์");

  const summary = useMemo(() => {
    const income = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
    const expense = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  function persist(items: Transaction[]) {
    setTransactions(items);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function addTransaction(event: FormEvent) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!title.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) return;

    persist([
      { id: Date.now(), type, title: title.trim(), amount: numericAmount, author: manager },
      ...transactions
    ]);
    setTitle("");
    setAmount("");
  }

  function removeTransaction(id: number) {
    if (!window.confirm("ลบรายการนี้หรือไม่? ยอดคงเหลือจะถูกคำนวณใหม่ทันที")) return;
    persist(transactions.filter((item) => item.id !== id));
  }

  function resetFund() {
    if (!window.confirm("คืนค่ารายการเงินกองกลางเป็นข้อมูลตัวอย่างหรือไม่?")) return;
    persist(initialTransactions);
  }

  return (
    <main className={styles.shell}>
      <section className={styles.phone}>
        <header className={styles.header}>
          <Link href="/" className={styles.back}>←</Link>
          <div><span>เงินกองกลาง</span><h1>บัญชีเดียวของทริป</h1></div>
        </header>

        <section className={styles.summary}>
          <small>ยอดคงเหลือ</small>
          <strong>{summary.balance.toLocaleString("th-TH")} บาท</strong>
          <div>
            <span>เงินเข้าทั้งหมด<b>{summary.income.toLocaleString("th-TH")}</b></span>
            <span>ใช้ไปแล้ว<b>{summary.expense.toLocaleString("th-TH")}</b></span>
          </div>
        </section>

        <section className={styles.managerCard}>
          <div><small>ผู้ดูแลการเงินจำลอง</small><strong>{manager}</strong></div>
          <select value={manager} onChange={(event) => setManager(event.target.value)}>
            <option>เมย์</option><option>SafeJJ</option><option>ปอนด์</option>
          </select>
        </section>

        <form className={styles.form} onSubmit={addTransaction}>
          <div className={styles.typeTabs}>
            <button className={type === "expense" ? styles.active : ""} type="button" onClick={() => setType("expense")}>รายจ่าย</button>
            <button className={type === "income" ? styles.active : ""} type="button" onClick={() => setType("income")}>เงินเข้า</button>
          </div>
          <label>ชื่อรายการ<input placeholder={type === "expense" ? "เช่น ค่าอาหารเย็น" : "เช่น เติมเงินกองกลาง"} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label>จำนวนเงิน<input inputMode="decimal" placeholder="0" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
          <button type="submit">บันทึกรายการ</button>
        </form>

        <div className={styles.sectionHeading}><h2>ประวัติรายการ</h2><span>{transactions.length} รายการ</span></div>
        <div className={styles.list}>
          {transactions.map((item) => (
            <article key={item.id}>
              <span className={item.type === "income" ? styles.incomeIcon : styles.expenseIcon}>{item.type === "income" ? "＋" : "−"}</span>
              <div><strong>{item.title}</strong><small>โดย {item.author}</small></div>
              <b className={item.type === "income" ? styles.incomeAmount : styles.expenseAmount}>{item.type === "income" ? "+" : "−"}{item.amount.toLocaleString("th-TH")}</b>
              <button type="button" onClick={() => removeTransaction(item.id)} aria-label={`ลบ ${item.title}`}>×</button>
            </article>
          ))}
        </div>

        <div className={styles.note}>ยอดระบบ = เงินเข้าทั้งหมด − รายจ่าย ทุกคนดูได้ แต่เฉพาะผู้ดูแลการเงินควรแก้ไขข้อมูลในระบบจริง</div>
        <button className={styles.reset} type="button" onClick={resetFund}>คืนค่าข้อมูลตัวอย่าง</button>
      </section>

      <aside className={styles.guide}>
        <span>PROTOTYPE 11</span><h2>เงินกองกลางที่ตรวจสอบได้</h2>
        <p>เพิ่มเงินเข้าและรายจ่ายจากบัญชีกลางเดียว ระบบคำนวณยอดคงเหลือทันทีและเก็บรายการไว้ในเบราว์เซอร์</p>
        <ol><li>เลือกผู้ดูแลจำลอง</li><li>เลือกเงินเข้าหรือรายจ่าย</li><li>บันทึกรายการ</li><li>ตรวจสอบยอดและประวัติ</li></ol>
      </aside>
    </main>
  );
}
