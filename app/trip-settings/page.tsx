"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import styles from "./page.module.css";

type TripSettings = {
  name: string;
  destination: string;
  leader: string;
  inviteEnabled: boolean;
  inviteCode: string;
};

const STORAGE_KEY = "travel-book-trip-settings";
const defaultSettings: TripSettings = {
  name: "แก๊งหลงทางเชียงใหม่ ✈️",
  destination: "เชียงใหม่",
  leader: "SafeJJ",
  inviteEnabled: true,
  inviteCode: "CM-7K2P"
};

function createInviteCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export default function TripSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nextLeader, setNextLeader] = useState("เมย์");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings(JSON.parse(raw) as TripSettings);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function persist(next: TripSettings) {
    setSettings(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function saveIdentity(event: FormEvent) {
    event.preventDefault();
    if (!settings.name.trim() || !settings.destination.trim()) return;
    persist({ ...settings, name: settings.name.trim(), destination: settings.destination.trim() });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  async function copyInvite() {
    const link = `https://travel-book.example/join/${settings.inviteCode}`;
    await navigator.clipboard?.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function toggleInvite() {
    persist({ ...settings, inviteEnabled: !settings.inviteEnabled });
  }

  function regenerateInvite() {
    if (!window.confirm("ลิงก์เดิมจะใช้เข้าร่วมไม่ได้ ต้องการสร้างลิงก์ใหม่หรือไม่?")) return;
    persist({ ...settings, inviteEnabled: true, inviteCode: createInviteCode() });
  }

  function transferLeadership() {
    if (!window.confirm(`ยืนยันโอนหัวหน้าทริปให้ ${nextLeader}? หลังโอน คุณจะเป็นสมาชิกทั่วไป`)) return;
    persist({ ...settings, leader: nextLeader });
  }

  return (
    <main className={styles.shell}>
      <section className={styles.phone}>
        <header className={styles.header}>
          <Link href="/" className={styles.back}>←</Link>
          <div><span>ตั้งค่าทริป</span><h1>จัดการโดยหัวหน้าทริป</h1></div>
        </header>

        <section className={styles.leaderCard}>
          <span>👑</span>
          <div><small>หัวหน้าทริปปัจจุบัน</small><strong>{settings.leader}</strong></div>
        </section>

        <form className={styles.card} onSubmit={saveIdentity}>
          <div className={styles.cardTitle}><span>ข้อมูลทริป</span><small>หัวหน้าแก้ไขได้เท่านั้น</small></div>
          <label>ชื่อทริป<input value={settings.name} maxLength={40} onChange={(event) => setSettings({ ...settings, name: event.target.value })} /></label>
          <label>จุดหมาย<input value={settings.destination} maxLength={50} onChange={(event) => setSettings({ ...settings, destination: event.target.value })} /></label>
          <button className={styles.primary} type="submit">{saved ? "บันทึกแล้ว ✓" : "บันทึกข้อมูลทริป"}</button>
        </form>

        <section className={styles.card}>
          <div className={styles.cardTitle}><span>ลิงก์เชิญหลัก</span><small>{settings.inviteEnabled ? "เปิดใช้งาน" : "ปิดอยู่"}</small></div>
          <div className={styles.inviteBox}>
            <code>{settings.inviteEnabled ? `travel-book.example/join/${settings.inviteCode}` : "ลิงก์ถูกปิดใช้งาน"}</code>
            <button type="button" onClick={copyInvite} disabled={!settings.inviteEnabled}>{copied ? "คัดลอกแล้ว" : "คัดลอก"}</button>
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={toggleInvite}>{settings.inviteEnabled ? "ปิดลิงก์" : "เปิดลิงก์"}</button>
            <button type="button" onClick={regenerateInvite}>สร้างลิงก์ใหม่</button>
          </div>
          <p className={styles.note}>สมาชิกเดิมยังอยู่ในทริป แม้ปิดหรือเปลี่ยนลิงก์เชิญ</p>
        </section>

        <section className={styles.card}>
          <div className={styles.cardTitle}><span>โอนหัวหน้าทริป</span><small>การเปลี่ยนแปลงสำคัญ</small></div>
          <label>หัวหน้าคนใหม่<select value={nextLeader} onChange={(event) => setNextLeader(event.target.value)}><option>เมย์</option><option>ปอนด์</option></select></label>
          <button className={styles.warning} type="button" onClick={transferLeadership}>โอนสิทธิ์หัวหน้าทริป</button>
          <p className={styles.note}>หนึ่งทริปมีหัวหน้าได้เพียงคนเดียว และหัวหน้าคนเดิมจะกลายเป็นสมาชิก</p>
        </section>

        <section className={styles.locked}>
          <span>🔒</span><div><strong>การลบทริปยังไม่เปิดใน Prototype</strong><small>เพื่อป้องกันการลบข้อมูลทดลองโดยไม่ตั้งใจ</small></div>
        </section>
      </section>

      <aside className={styles.guide}>
        <span>PROTOTYPE 12</span>
        <h2>สิทธิ์สำคัญต้องชัดเจน</h2>
        <p>หน้าตั้งค่ารวมเฉพาะงานที่มีผลต่อทั้งทริป เช่น เปลี่ยนข้อมูล ลิงก์เชิญ และหัวหน้าทริป</p>
        <ol><li>แก้ชื่อและจุดหมาย</li><li>เปิด ปิด หรือเปลี่ยนลิงก์เชิญ</li><li>โอนหัวหน้าพร้อมยืนยัน</li><li>กันการลบที่เสี่ยงออกจาก Flow ทดลอง</li></ol>
      </aside>
    </main>
  );
}
