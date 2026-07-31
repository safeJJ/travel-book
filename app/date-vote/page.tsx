"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./page.module.css";

type DateChoice = {
  id: number;
  label: string;
  detail: string;
  votes: string[];
};

const members = [
  { name: "SafeJJ", avatar: "👑" },
  { name: "เมย์", avatar: "😎" },
  { name: "ปอนด์", avatar: "🐻" }
];

const initialChoices: DateChoice[] = [
  { id: 1, label: "15–18 ส.ค.", detail: "ศุกร์–จันทร์ · 4 วัน 3 คืน", votes: ["SafeJJ", "เมย์"] },
  { id: 2, label: "22–25 ส.ค.", detail: "ศุกร์–จันทร์ · 4 วัน 3 คืน", votes: ["SafeJJ", "เมย์", "ปอนด์"] },
  { id: 3, label: "29 ส.ค.–1 ก.ย.", detail: "ศุกร์–จันทร์ · 4 วัน 3 คืน", votes: ["ปอนด์"] }
];

export default function DateVotePage() {
  const [choices, setChoices] = useState(initialChoices);
  const [currentMember, setCurrentMember] = useState("เมย์");
  const [confirmedId, setConfirmedId] = useState<number | null>(null);

  const bestChoice = useMemo(
    () => [...choices].sort((a, b) => b.votes.length - a.votes.length)[0],
    [choices]
  );

  function toggleAvailability(id: number) {
    if (confirmedId !== null) return;

    setChoices((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        const selected = item.votes.includes(currentMember);
        return {
          ...item,
          votes: selected
            ? item.votes.filter((name) => name !== currentMember)
            : [...item.votes, currentMember]
        };
      })
    );
  }

  return (
    <main className={styles.shell}>
      <section className={styles.phone}>
        <header className={styles.header}>
          <Link href="/" className={styles.back}>←</Link>
          <div>
            <span>เลือกวันร่วมกัน</span>
            <h1>ช่วงไหนทุกคนสะดวก?</h1>
          </div>
        </header>

        <section className={styles.identityCard}>
          <div>
            <small>กำลังตอบในชื่อ</small>
            <strong>{currentMember}</strong>
          </div>
          <select value={currentMember} onChange={(event) => setCurrentMember(event.target.value)} disabled={confirmedId !== null}>
            {members.map((member) => <option key={member.name}>{member.name}</option>)}
          </select>
        </section>

        <p className={styles.intro}>แตะได้หลายช่วง วันที่มีคนว่างมากที่สุดจะถูกแนะนำให้หัวหน้าทริปยืนยัน</p>

        <div className={styles.choiceList}>
          {choices.map((choice) => {
            const selected = choice.votes.includes(currentMember);
            const confirmed = confirmedId === choice.id;
            return (
              <button
                key={choice.id}
                className={`${styles.choiceCard} ${selected ? styles.selected : ""} ${confirmed ? styles.confirmed : ""}`}
                type="button"
                onClick={() => toggleAvailability(choice.id)}
              >
                <div className={styles.check}>{confirmed ? "✓" : selected ? "✓" : ""}</div>
                <div className={styles.choiceText}>
                  <strong>{choice.label}</strong>
                  <small>{choice.detail}</small>
                  <div className={styles.avatarRow}>
                    {members.map((member) => (
                      <span key={member.name} className={choice.votes.includes(member.name) ? styles.available : styles.unavailable} title={member.name}>
                        {member.avatar}
                      </span>
                    ))}
                    <b>{choice.votes.length}/{members.length} คนสะดวก</b>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {confirmedId === null ? (
          <section className={styles.recommendation}>
            <span>✨ ช่วงที่ลงตัวที่สุดตอนนี้</span>
            <strong>{bestChoice.label}</strong>
            <small>สมาชิกสะดวก {bestChoice.votes.length} จาก {members.length} คน</small>
            <button type="button" onClick={() => setConfirmedId(bestChoice.id)}>หัวหน้าทริปยืนยันช่วงนี้</button>
          </section>
        ) : (
          <section className={styles.confirmedNote}>
            <div className={styles.stamp}>ยืนยันแล้ว</div>
            <strong>{choices.find((choice) => choice.id === confirmedId)?.label}</strong>
            <p>ระบบจะใช้ช่วงนี้สร้างวันในตารางเดินทาง สมาชิกยังเปิดดูผลเดิมได้</p>
            <button type="button" onClick={() => setConfirmedId(null)}>เปิดให้เลือกใหม่</button>
          </section>
        )}

        <div className={styles.note}>Prototype นี้จำลองการเลือกวันร่วมกัน ข้อมูลจะหายเมื่อรีเฟรชหน้า</div>
      </section>

      <aside className={styles.guide}>
        <span>PROTOTYPE 07</span>
        <h2>ง่าย แต่เป็นงานของทั้งกลุ่ม</h2>
        <p>สมาชิกเลือกได้หลายช่วง ระบบช่วยชี้ช่วงที่ตรงกันมากที่สุด และให้หัวหน้าทริปเป็นผู้ยืนยันขั้นสุดท้าย</p>
        <ol>
          <li>เลือกชื่อสมาชิก</li>
          <li>แตะช่วงวันที่สะดวก</li>
          <li>ดูจำนวนคนที่ว่างตรงกัน</li>
          <li>หัวหน้าทริปยืนยันผล</li>
        </ol>
      </aside>
    </main>
  );
}
