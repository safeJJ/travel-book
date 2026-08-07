"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { removeStorage, writeStorage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { ConfirmedDates } from "@/types/trip";
import styles from "./date-vote.module.css";

type DateChoice = ConfirmedDates & {
  id: number;
  detail: string;
  votes: string[];
};

const members = [
  { name: "SafeJJ", avatar: "👑" },
  { name: "เมย์", avatar: "😎" },
  { name: "ปอนด์", avatar: "🐻" }
];

const initialChoices: DateChoice[] = [
  { id: 1, label: "15–18 ส.ค.", detail: "ศุกร์–จันทร์ · 4 วัน 3 คืน", start: "2026-08-15", end: "2026-08-18", votes: ["SafeJJ", "เมย์"] },
  { id: 2, label: "22–25 ส.ค.", detail: "ศุกร์–จันทร์ · 4 วัน 3 คืน", start: "2026-08-22", end: "2026-08-25", votes: ["SafeJJ", "เมย์", "ปอนด์"] },
  { id: 3, label: "29 ส.ค.–1 ก.ย.", detail: "ศุกร์–จันทร์ · 4 วัน 3 คืน", start: "2026-08-29", end: "2026-09-01", votes: ["ปอนด์"] }
];

export function DateVoteScreen() {
  const [choices, setChoices] = useState(initialChoices);
  const [currentMember, setCurrentMember] = useState("เมย์");
  const [confirmedId, setConfirmedId] = useState<number | null>(null);

  const bestChoice = useMemo(
    () => [...choices].sort((a, b) => b.votes.length - a.votes.length)[0],
    [choices]
  );
  const confirmedChoice = choices.find((choice) => choice.id === confirmedId);

  function toggleAvailability(id: number) {
    if (confirmedId !== null) return;
    setChoices((items) => items.map((item) => {
      if (item.id !== id) return item;
      const selected = item.votes.includes(currentMember);
      return { ...item, votes: selected ? item.votes.filter((name) => name !== currentMember) : [...item.votes, currentMember] };
    }));
  }

  function confirmChoice(choice: DateChoice) {
    setConfirmedId(choice.id);
    writeStorage<ConfirmedDates>(STORAGE_KEYS.confirmedDates, {
      label: choice.label,
      start: choice.start,
      end: choice.end
    });
  }

  function reopenVote() {
    setConfirmedId(null);
    removeStorage(STORAGE_KEYS.confirmedDates);
  }

  return (
    <main className={styles.shell}>
      <section className={styles.phone}>
        <header className={styles.header}>
          <Link href="/" className={styles.back}>←</Link>
          <div><span>เลือกวันร่วมกัน</span><h1>ช่วงไหนทุกคนสะดวก?</h1></div>
        </header>

        <section className={styles.identityCard}>
          <div><small>กำลังตอบในชื่อ</small><strong>{currentMember}</strong></div>
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
              <button key={choice.id} className={`${styles.choiceCard} ${selected ? styles.selected : ""} ${confirmed ? styles.confirmed : ""}`} type="button" onClick={() => toggleAvailability(choice.id)}>
                <div className={styles.check}>{confirmed || selected ? "✓" : ""}</div>
                <div className={styles.choiceText}>
                  <strong>{choice.label}</strong><small>{choice.detail}</small>
                  <div className={styles.avatarRow}>
                    {members.map((member) => <span key={member.name} className={choice.votes.includes(member.name) ? styles.available : styles.unavailable} title={member.name}>{member.avatar}</span>)}
                    <b>{choice.votes.length}/{members.length} คนสะดวก</b>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {confirmedId === null ? (
          <section className={styles.recommendation}>
            <span>✨ ช่วงที่ลงตัวที่สุดตอนนี้</span><strong>{bestChoice.label}</strong>
            <small>สมาชิกสะดวก {bestChoice.votes.length} จาก {members.length} คน</small>
            <button type="button" onClick={() => confirmChoice(bestChoice)}>หัวหน้าทริปยืนยันช่วงนี้</button>
          </section>
        ) : (
          <section className={styles.confirmedNote}>
            <div className={styles.stamp}>ยืนยันแล้ว</div><strong>{confirmedChoice?.label}</strong>
            <p>บันทึกช่วงวันไว้ในเบราว์เซอร์แล้ว และพร้อมนำไปสร้างตารางเดินทาง</p>
            <Link href="/">กลับไปหน้าหลัก</Link>
            <button type="button" onClick={reopenVote}>เปิดให้เลือกใหม่</button>
          </section>
        )}

        <div className={styles.note}>ข้อมูลช่วงวันที่ยืนยันจะอยู่ในเบราว์เซอร์เครื่องนี้ จนกว่าจะเปิดให้เลือกใหม่</div>
      </section>

      <aside className={styles.guide}>
        <span>PROTOTYPE 08</span><h2>จากผลโหวตสู่วันเดินทาง</h2>
        <p>เมื่อหัวหน้าทริปยืนยัน ระบบจะบันทึกช่วงวันไว้และพากลับเข้าสู่ Flow หลักของทริป</p>
        <ol><li>สมาชิกเลือกวันที่สะดวก</li><li>ระบบแนะนำช่วงที่ลงตัว</li><li>หัวหน้าทริปยืนยัน</li><li>กลับไปวางตารางเดินทาง</li></ol>
      </aside>
    </main>
  );
}
