"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { readStorage, writeStorage } from "../../lib/storage";
import { STORAGE_KEYS } from "../../lib/storage-keys";
import type { ConfirmedDates, DailyActivity, DailyPlan, TripSettings } from "../../types/trip";
import styles from "./simple-trip-platform.module.css";

type Tab = "home" | "plan" | "tasks" | "memories";
type Task = { id: number; title: string; done: boolean };
type Memory = { id: number; emoji: string; caption: string };
type Place = { id: number; emoji: string; name: string };

const defaultSettings: TripSettings = {
  name: "แก๊งหลงทางเชียงใหม่ ✈️",
  destination: "เชียงใหม่",
  leader: "SafeJJ",
  inviteEnabled: true,
  inviteCode: "CHIANG-MAI"
};

const defaultPlan: DailyPlan = {
  "1": [
    { id: 1, time: "09:00", title: "คาเฟ่ริมเขา", note: "เริ่มวันแบบชิล ๆ" },
    { id: 2, time: "11:30", title: "เดินเมืองเก่า", note: "ถ่ายรูปและหาอาหารกลางวัน" }
  ]
};

const defaultTasks: Task[] = [
  { id: 1, title: "จองที่พัก", done: true },
  { id: 2, title: "เตรียมเสื้อกันหนาว", done: false },
  { id: 3, title: "เช็กรถเช่า", done: false }
];

const defaultMemories: Memory[] = [
  { id: 1, emoji: "🏔️", caption: "วิวแรกของทริป" },
  { id: 2, emoji: "☕", caption: "กาแฟแก้วแรก" }
];

const defaultPlaces: Place[] = [
  { id: 1, emoji: "🧱", name: "ประตูท่าแพ" },
  { id: 2, emoji: "🏡", name: "บ้านพักริมปิง" },
  { id: 3, emoji: "🍜", name: "ข้าวซอยแม่สาย" }
];

function getDayCount(dates: ConfirmedDates | null) {
  if (!dates) return 2;
  const start = new Date(`${dates.start}T00:00:00`);
  const end = new Date(`${dates.end}T00:00:00`);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
}

export default function SimpleTripPlatform() {
  const [tab, setTab] = useState<Tab>("home");
  const [settings, setSettings] = useState(defaultSettings);
  const [dates, setDates] = useState<ConfirmedDates | null>(null);
  const [plan, setPlan] = useState<DailyPlan>(defaultPlan);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [memories, setMemories] = useState<Memory[]>(defaultMemories);
  const [places, setPlaces] = useState<Place[]>(defaultPlaces);
  const [activeDay, setActiveDay] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [activityTitle, setActivityTitle] = useState("");
  const [activityTime, setActivityTime] = useState("14:00");
  const [taskTitle, setTaskTitle] = useState("");
  const [memoryCaption, setMemoryCaption] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSettings(readStorage(STORAGE_KEYS.tripSettings, defaultSettings));
    setDates(readStorage<ConfirmedDates | null>(STORAGE_KEYS.confirmedDates, null));
    setPlan(readStorage(STORAGE_KEYS.dailyItinerary, defaultPlan));
    setTasks(readStorage(STORAGE_KEYS.tasks, defaultTasks));
    setMemories(readStorage(STORAGE_KEYS.memories, defaultMemories));
    setPlaces(readStorage(STORAGE_KEYS.places, defaultPlaces));
  }, []);

  const totalDays = getDayCount(dates);
  const currentActivities = plan[String(activeDay)] ?? [];
  const completedTasks = tasks.filter((task) => task.done).length;

  const nextAction = useMemo(() => {
    if (!dates) return { icon: "📅", title: "เลือกวันเดินทาง", detail: "ให้ทุกคนเลือกวันที่สะดวก", action: "dates" as const };
    if (places.length === 0) return { icon: "📍", title: "เพิ่มสถานที่แรก", detail: "เก็บที่เที่ยว ที่พัก หรือร้านอาหาร", action: "plan" as const };
    return { icon: "🗓️", title: "เติมแผนวันถัดไป", detail: `${currentActivities.length} กิจกรรมในวันที่ ${activeDay}`, action: "plan" as const };
  }, [dates, places.length, currentActivities.length, activeDay]);

  function saveSettings(event: FormEvent) {
    event.preventDefault();
    writeStorage(STORAGE_KEYS.tripSettings, settings);
    setShowSettings(false);
  }

  function addActivity(event: FormEvent) {
    event.preventDefault();
    if (!activityTitle.trim()) return;
    const activity: DailyActivity = {
      id: Date.now(),
      time: activityTime,
      title: activityTitle.trim(),
      note: "เพิ่มโดยสมาชิก"
    };
    const next = { ...plan, [String(activeDay)]: [...currentActivities, activity] };
    setPlan(next);
    writeStorage(STORAGE_KEYS.dailyItinerary, next);
    setActivityTitle("");
  }

  function addTask(event: FormEvent) {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    const next = [...tasks, { id: Date.now(), title: taskTitle.trim(), done: false }];
    setTasks(next);
    writeStorage(STORAGE_KEYS.tasks, next);
    setTaskTitle("");
  }

  function toggleTask(id: number) {
    const next = tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task);
    setTasks(next);
    writeStorage(STORAGE_KEYS.tasks, next);
  }

  function addMemory(event: FormEvent) {
    event.preventDefault();
    if (!memoryCaption.trim()) return;
    const next = [...memories, { id: Date.now(), emoji: "📸", caption: memoryCaption.trim() }];
    setMemories(next);
    writeStorage(STORAGE_KEYS.memories, next);
    setMemoryCaption("");
  }

  function addPlace(event: FormEvent) {
    event.preventDefault();
    if (!placeName.trim()) return;
    const next = [...places, { id: Date.now(), emoji: "📍", name: placeName.trim() }];
    setPlaces(next);
    writeStorage(STORAGE_KEYS.places, next);
    setPlaceName("");
  }

  async function copyInvite() {
    await navigator.clipboard?.writeText(`https://travel-book.example/join/${settings.inviteCode}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <main className={styles.shell}>
      <section className={styles.phone}>
        <header className={styles.hero}>
          <div className={styles.heroTop}>
            <span>{settings.destination}</span>
            <button type="button" onClick={() => setShowSettings(true)} aria-label="ตั้งค่าทริป">•••</button>
          </div>
          <h1>{settings.name}</h1>
          <p>{dates?.label ?? "ยังไม่ได้เลือกวันเดินทาง"}</p>
          <div className={styles.members}><span>👑</span><span>😎</span><span>🐻</span><small>3 คน</small></div>
        </header>

        {tab === "home" && (
          <div className={styles.content}>
            <button className={styles.nextAction} type="button" onClick={() => nextAction.action === "dates" ? window.location.assign("/date-vote") : setTab("plan")}>
              <span>{nextAction.icon}</span><div><small>ทำต่อ</small><strong>{nextAction.title}</strong><p>{nextAction.detail}</p></div><b>›</b>
            </button>

            <section className={styles.simpleSection}>
              <div className={styles.sectionTitle}><h2>ภาพรวม</h2></div>
              <div className={styles.summaryGrid}>
                <button type="button" onClick={() => setTab("plan")}><span>🗓️</span><strong>{Object.values(plan).flat().length}</strong><small>กิจกรรม</small></button>
                <button type="button" onClick={() => setTab("tasks")}><span>✅</span><strong>{completedTasks}/{tasks.length}</strong><small>งานเสร็จแล้ว</small></button>
                <button type="button" onClick={() => setTab("plan")}><span>📍</span><strong>{places.length}</strong><small>สถานที่</small></button>
                <button type="button" onClick={() => setTab("memories")}><span>📸</span><strong>{memories.length}</strong><small>ความทรงจำ</small></button>
              </div>
            </section>

            <section className={styles.simpleSection}>
              <div className={styles.sectionTitle}><h2>เพื่อนร่วมทริป</h2><button type="button" onClick={copyInvite}>{copied ? "คัดลอกแล้ว" : "ชวนเพื่อน"}</button></div>
              <div className={styles.memberRow}><span>👑</span><div><strong>{settings.leader}</strong><small>หัวหน้าทริป</small></div></div>
              <div className={styles.memberRow}><span>😎</span><div><strong>เมย์</strong><small>สมาชิก</small></div></div>
              <div className={styles.memberRow}><span>🐻</span><div><strong>ปอนด์</strong><small>สมาชิก</small></div></div>
            </section>
          </div>
        )}

        {tab === "plan" && (
          <div className={styles.content}>
            <div className={styles.pageTitle}><div><small>แผนทริป</small><h2>{settings.destination}</h2></div><Link href="/date-vote">แก้วัน</Link></div>
            <div className={styles.dayTabs}>{Array.from({ length: totalDays }, (_, index) => index + 1).map((day) => <button key={day} className={activeDay === day ? styles.activeDay : ""} type="button" onClick={() => setActiveDay(day)}>วันที่ {day}</button>)}</div>
            <div className={styles.timeline}>{currentActivities.length === 0 ? <div className={styles.empty}>วันนี้ยังไม่มีแผน</div> : currentActivities.slice().sort((a, b) => a.time.localeCompare(b.time)).map((activity) => <article key={activity.id}><time>{activity.time}</time><div><strong>{activity.title}</strong><small>{activity.note}</small></div></article>)}</div>
            <form className={styles.inlineForm} onSubmit={addActivity}><input type="time" value={activityTime} onChange={(event) => setActivityTime(event.target.value)} /><input placeholder="เพิ่มกิจกรรม" value={activityTitle} onChange={(event) => setActivityTitle(event.target.value)} /><button type="submit">เพิ่ม</button></form>

            <section className={styles.simpleSection}>
              <div className={styles.sectionTitle}><h2>สถานที่ที่เก็บไว้</h2></div>
              <div className={styles.placeList}>{places.map((place) => <div key={place.id}><span>{place.emoji}</span><strong>{place.name}</strong></div>)}</div>
              <form className={styles.inlineForm} onSubmit={addPlace}><input className={styles.fullInput} placeholder="เพิ่มสถานที่" value={placeName} onChange={(event) => setPlaceName(event.target.value)} /><button type="submit">เพิ่ม</button></form>
            </section>
          </div>
        )}

        {tab === "tasks" && (
          <div className={styles.content}>
            <div className={styles.pageTitle}><div><small>งานที่ต้องทำ</small><h2>{completedTasks}/{tasks.length} งานเสร็จแล้ว</h2></div></div>
            <div className={styles.taskList}>{tasks.map((task) => <button key={task.id} type="button" onClick={() => toggleTask(task.id)}><span className={task.done ? styles.doneCheck : styles.check}>{task.done ? "✓" : ""}</span><strong className={task.done ? styles.doneText : ""}>{task.title}</strong></button>)}</div>
            <form className={styles.inlineForm} onSubmit={addTask}><input className={styles.fullInput} placeholder="เพิ่มงานใหม่" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} /><button type="submit">เพิ่ม</button></form>
          </div>
        )}

        {tab === "memories" && (
          <div className={styles.content}>
            <div className={styles.pageTitle}><div><small>สมุดทริป</small><h2>เรื่องราวของพวกเรา</h2></div></div>
            <div className={styles.memoryGrid}>{memories.map((memory) => <article key={memory.id}><div>{memory.emoji}</div><strong>{memory.caption}</strong></article>)}</div>
            <form className={styles.inlineForm} onSubmit={addMemory}><input className={styles.fullInput} placeholder="วันนี้มีอะไรน่าจำ?" value={memoryCaption} onChange={(event) => setMemoryCaption(event.target.value)} /><button type="submit">เพิ่ม</button></form>
          </div>
        )}

        <nav className={styles.nav} aria-label="เมนูหลัก">
          <button className={tab === "home" ? styles.activeNav : ""} type="button" onClick={() => setTab("home")}><span>⌂</span><small>หน้าหลัก</small></button>
          <button className={tab === "plan" ? styles.activeNav : ""} type="button" onClick={() => setTab("plan")}><span>▤</span><small>แผนทริป</small></button>
          <button className={tab === "tasks" ? styles.activeNav : ""} type="button" onClick={() => setTab("tasks")}><span>✓</span><small>งาน</small></button>
          <button className={tab === "memories" ? styles.activeNav : ""} type="button" onClick={() => setTab("memories")}><span>▧</span><small>สมุดทริป</small></button>
        </nav>

        {showSettings && (
          <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="ตั้งค่าทริป">
            <form className={styles.sheet} onSubmit={saveSettings}>
              <div className={styles.sheetTitle}><h2>ตั้งค่าทริป</h2><button type="button" onClick={() => setShowSettings(false)}>×</button></div>
              <label>ชื่อทริป<input value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} /></label>
              <label>จุดหมาย<input value={settings.destination} onChange={(event) => setSettings({ ...settings, destination: event.target.value })} /></label>
              <button className={styles.primary} type="submit">บันทึก</button>
            </form>
          </div>
        )}
      </section>

      <aside className={styles.guide}>
        <span>SIMPLE PLATFORM</span>
        <h2>หนึ่งทริป หนึ่งพื้นที่</h2>
        <p>ทุกอย่างที่เพื่อนต้องใช้ถูกรวมไว้ใน 4 ส่วนหลัก โดยไม่ทำให้ผู้ใช้ต้องเรียนรู้เมนูซับซ้อน</p>
        <ol><li>หน้าหลักสำหรับภาพรวมและสมาชิก</li><li>แผนทริปรวมตารางกับสถานที่</li><li>งานที่ต้องทำ</li><li>สมุดทริป</li></ol>
      </aside>
    </main>
  );
}
