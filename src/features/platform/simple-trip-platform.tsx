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
type Member = { id: number; avatar: string; name: string; role: string };

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

const defaultMembers: Member[] = [
  { id: 1, avatar: "👑", name: "SafeJJ", role: "หัวหน้าทริป" },
  { id: 2, avatar: "😎", name: "เมย์", role: "สมาชิก" },
  { id: 3, avatar: "🐻", name: "ปอนด์", role: "สมาชิก" }
];

function getDayCount(dates: ConfirmedDates | null) {
  if (!dates) return 2;
  const start = new Date(`${dates.start}T00:00:00`);
  const end = new Date(`${dates.end}T00:00:00`);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
}

function ask(label: string, currentValue: string) {
  const value = window.prompt(label, currentValue);
  return value?.trim() || null;
}

export default function SimpleTripPlatform() {
  const [tab, setTab] = useState<Tab>("home");
  const [settings, setSettings] = useState(defaultSettings);
  const [dates, setDates] = useState<ConfirmedDates | null>(null);
  const [plan, setPlan] = useState<DailyPlan>(defaultPlan);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [memories, setMemories] = useState<Memory[]>(defaultMemories);
  const [places, setPlaces] = useState<Place[]>(defaultPlaces);
  const [members, setMembers] = useState<Member[]>(defaultMembers);
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
    setMembers(readStorage(STORAGE_KEYS.members, defaultMembers));
  }, []);

  const totalDays = getDayCount(dates);
  const currentActivities = plan[String(activeDay)] ?? [];
  const completedTasks = tasks.filter((task) => task.done).length;

  const nextAction = useMemo(() => {
    if (!dates) return { icon: "📅", title: "เลือกวันเดินทาง", detail: "ให้ทุกคนเลือกวันที่สะดวก", action: "dates" as const };
    if (places.length === 0) return { icon: "📍", title: "เพิ่มสถานที่แรก", detail: "เก็บที่เที่ยว ที่พัก หรือร้านอาหาร", action: "plan" as const };
    return { icon: "🗓️", title: "เติมแผนวันถัดไป", detail: `${currentActivities.length} กิจกรรมในวันที่ ${activeDay}`, action: "plan" as const };
  }, [dates, places.length, currentActivities.length, activeDay]);

  function persistPlan(next: DailyPlan) {
    setPlan(next);
    writeStorage(STORAGE_KEYS.dailyItinerary, next);
  }

  function persistTasks(next: Task[]) {
    setTasks(next);
    writeStorage(STORAGE_KEYS.tasks, next);
  }

  function persistPlaces(next: Place[]) {
    setPlaces(next);
    writeStorage(STORAGE_KEYS.places, next);
  }

  function persistMemories(next: Memory[]) {
    setMemories(next);
    writeStorage(STORAGE_KEYS.memories, next);
  }

  function persistMembers(next: Member[]) {
    setMembers(next);
    writeStorage(STORAGE_KEYS.members, next);
  }

  function saveSettings(event: FormEvent) {
    event.preventDefault();
    const nextMembers = members.map((member) => member.role === "หัวหน้าทริป" ? { ...member, name: settings.leader } : member);
    persistMembers(nextMembers);
    writeStorage(STORAGE_KEYS.tripSettings, settings);
    setShowSettings(false);
  }

  function addActivity(event: FormEvent) {
    event.preventDefault();
    if (!activityTitle.trim()) return;
    const activity: DailyActivity = { id: Date.now(), time: activityTime, title: activityTitle.trim(), note: "เพิ่มโดยสมาชิก" };
    persistPlan({ ...plan, [String(activeDay)]: [...currentActivities, activity] });
    setActivityTitle("");
  }

  function editActivity(activity: DailyActivity) {
    const time = ask("แก้ไขเวลา", activity.time);
    if (!time) return;
    const title = ask("แก้ไขชื่อกิจกรรม", activity.title);
    if (!title) return;
    const note = ask("แก้ไขหมายเหตุ", activity.note);
    if (!note) return;
    persistPlan({ ...plan, [String(activeDay)]: currentActivities.map((item) => item.id === activity.id ? { ...item, time, title, note } : item) });
  }

  function deleteActivity(id: number) {
    if (!window.confirm("ลบกิจกรรมนี้หรือไม่?")) return;
    persistPlan({ ...plan, [String(activeDay)]: currentActivities.filter((item) => item.id !== id) });
  }

  function addTask(event: FormEvent) {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    persistTasks([...tasks, { id: Date.now(), title: taskTitle.trim(), done: false }]);
    setTaskTitle("");
  }

  function toggleTask(id: number) {
    persistTasks(tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function editTask(task: Task) {
    const title = ask("แก้ไขงาน", task.title);
    if (title) persistTasks(tasks.map((item) => item.id === task.id ? { ...item, title } : item));
  }

  function deleteTask(id: number) {
    if (window.confirm("ลบงานนี้หรือไม่?")) persistTasks(tasks.filter((task) => task.id !== id));
  }

  function addMemory(event: FormEvent) {
    event.preventDefault();
    if (!memoryCaption.trim()) return;
    persistMemories([...memories, { id: Date.now(), emoji: "📸", caption: memoryCaption.trim() }]);
    setMemoryCaption("");
  }

  function editMemory(memory: Memory) {
    const emoji = ask("แก้ไขอีโมจิหรือสัญลักษณ์", memory.emoji);
    if (!emoji) return;
    const caption = ask("แก้ไขข้อความ", memory.caption);
    if (caption) persistMemories(memories.map((item) => item.id === memory.id ? { ...item, emoji, caption } : item));
  }

  function deleteMemory(id: number) {
    if (window.confirm("ลบความทรงจำนี้หรือไม่?")) persistMemories(memories.filter((memory) => memory.id !== id));
  }

  function addPlace(event: FormEvent) {
    event.preventDefault();
    if (!placeName.trim()) return;
    persistPlaces([...places, { id: Date.now(), emoji: "📍", name: placeName.trim() }]);
    setPlaceName("");
  }

  function editPlace(place: Place) {
    const emoji = ask("แก้ไขอีโมจิหรือสัญลักษณ์", place.emoji);
    if (!emoji) return;
    const name = ask("แก้ไขชื่อสถานที่", place.name);
    if (name) persistPlaces(places.map((item) => item.id === place.id ? { ...item, emoji, name } : item));
  }

  function deletePlace(id: number) {
    if (window.confirm("ลบสถานที่นี้หรือไม่?")) persistPlaces(places.filter((place) => place.id !== id));
  }

  function addMember() {
    const name = ask("ชื่อสมาชิกใหม่", "เพื่อนใหม่");
    if (!name) return;
    const avatar = ask("อีโมจิประจำตัว", "🙂") || "🙂";
    persistMembers([...members, { id: Date.now(), avatar, name, role: "สมาชิก" }]);
  }

  function editMember(member: Member) {
    const name = ask("แก้ไขชื่อสมาชิก", member.name);
    if (!name) return;
    const avatar = ask("แก้ไขอีโมจิ", member.avatar) || member.avatar;
    const role = ask("แก้ไขบทบาท", member.role) || member.role;
    const next = members.map((item) => item.id === member.id ? { ...item, name, avatar, role } : item);
    persistMembers(next);
    if (member.role === "หัวหน้าทริป" || role === "หัวหน้าทริป") {
      const nextSettings = { ...settings, leader: name };
      setSettings(nextSettings);
      writeStorage(STORAGE_KEYS.tripSettings, nextSettings);
    }
  }

  function deleteMember(member: Member) {
    if (member.role === "หัวหน้าทริป") {
      window.alert("Mockup นี้ยังไม่ให้ลบหัวหน้าทริปโดยตรง กรุณาแก้บทบาทก่อน");
      return;
    }
    if (window.confirm(`ลบ ${member.name} ออกจากทริปหรือไม่?`)) persistMembers(members.filter((item) => item.id !== member.id));
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
          <div className={styles.heroTop}><span>{settings.destination}</span><button type="button" onClick={() => setShowSettings(true)} aria-label="ตั้งค่าทริป">•••</button></div>
          <h1>{settings.name}</h1>
          <p>{dates?.label ?? "ยังไม่ได้เลือกวันเดินทาง"}</p>
          <div className={styles.members}>{members.slice(0, 4).map((member) => <span key={member.id} title={member.name}>{member.avatar}</span>)}<small>{members.length} คน</small></div>
        </header>

        {tab === "home" && (
          <div className={styles.content}>
            <button className={styles.nextAction} type="button" onClick={() => nextAction.action === "dates" ? window.location.assign("/date-vote") : setTab("plan")}><span>{nextAction.icon}</span><div><small>ทำต่อ</small><strong>{nextAction.title}</strong><p>{nextAction.detail}</p></div><b>›</b></button>
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
              <div className={styles.sectionTitle}><h2>เพื่อนร่วมทริป</h2><div className={styles.titleActions}><button type="button" onClick={copyInvite}>{copied ? "คัดลอกแล้ว" : "ชวนเพื่อน"}</button><button type="button" onClick={addMember}>+ เพิ่ม</button></div></div>
              {members.map((member) => <div className={styles.memberRow} key={member.id}><span>{member.avatar}</span><div><strong>{member.name}</strong><small>{member.role}</small></div><div className={styles.rowActions}><button type="button" onClick={() => editMember(member)}>แก้</button><button type="button" onClick={() => deleteMember(member)}>ลบ</button></div></div>)}
            </section>
          </div>
        )}

        {tab === "plan" && (
          <div className={styles.content}>
            <div className={styles.pageTitle}><div><small>แผนทริป</small><h2>{settings.destination}</h2></div><Link href="/date-vote">แก้วัน</Link></div>
            <div className={styles.dayTabs}>{Array.from({ length: totalDays }, (_, index) => index + 1).map((day) => <button key={day} className={activeDay === day ? styles.activeDay : ""} type="button" onClick={() => setActiveDay(day)}>วันที่ {day}</button>)}</div>
            <div className={styles.timeline}>{currentActivities.length === 0 ? <div className={styles.empty}>วันนี้ยังไม่มีแผน</div> : currentActivities.slice().sort((a, b) => a.time.localeCompare(b.time)).map((activity) => <article key={activity.id}><time>{activity.time}</time><div><strong>{activity.title}</strong><small>{activity.note}</small></div><div className={styles.rowActions}><button type="button" onClick={() => editActivity(activity)}>แก้</button><button type="button" onClick={() => deleteActivity(activity.id)}>ลบ</button></div></article>)}</div>
            <form className={styles.inlineForm} onSubmit={addActivity}><input type="time" value={activityTime} onChange={(event) => setActivityTime(event.target.value)} /><input placeholder="เพิ่มกิจกรรม" value={activityTitle} onChange={(event) => setActivityTitle(event.target.value)} /><button type="submit">เพิ่ม</button></form>
            <section className={styles.simpleSection}>
              <div className={styles.sectionTitle}><h2>สถานที่ที่เก็บไว้</h2></div>
              <div className={styles.placeList}>{places.map((place) => <div key={place.id}><span>{place.emoji}</span><strong>{place.name}</strong><div className={styles.rowActions}><button type="button" onClick={() => editPlace(place)}>แก้</button><button type="button" onClick={() => deletePlace(place.id)}>ลบ</button></div></div>)}</div>
              <form className={styles.inlineForm} onSubmit={addPlace}><input className={styles.fullInput} placeholder="เพิ่มสถานที่" value={placeName} onChange={(event) => setPlaceName(event.target.value)} /><button type="submit">เพิ่ม</button></form>
            </section>
          </div>
        )}

        {tab === "tasks" && (
          <div className={styles.content}>
            <div className={styles.pageTitle}><div><small>งานที่ต้องทำ</small><h2>{completedTasks}/{tasks.length} งานเสร็จแล้ว</h2></div></div>
            <div className={styles.taskList}>{tasks.map((task) => <div className={styles.taskRow} key={task.id}><button className={styles.taskToggle} type="button" onClick={() => toggleTask(task.id)}><span className={task.done ? styles.doneCheck : styles.check}>{task.done ? "✓" : ""}</span><strong className={task.done ? styles.doneText : ""}>{task.title}</strong></button><div className={styles.rowActions}><button type="button" onClick={() => editTask(task)}>แก้</button><button type="button" onClick={() => deleteTask(task.id)}>ลบ</button></div></div>)}</div>
            <form className={styles.inlineForm} onSubmit={addTask}><input className={styles.fullInput} placeholder="เพิ่มงานใหม่" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} /><button type="submit">เพิ่ม</button></form>
          </div>
        )}

        {tab === "memories" && (
          <div className={styles.content}>
            <div className={styles.pageTitle}><div><small>สมุดทริป</small><h2>เรื่องราวของพวกเรา</h2></div></div>
            <div className={styles.memoryGrid}>{memories.map((memory) => <article key={memory.id}><div>{memory.emoji}</div><strong>{memory.caption}</strong><div className={styles.cardActions}><button type="button" onClick={() => editMemory(memory)}>แก้ไข</button><button type="button" onClick={() => deleteMemory(memory.id)}>ลบ</button></div></article>)}</div>
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
              <label>หัวหน้าทริป<input value={settings.leader} onChange={(event) => setSettings({ ...settings, leader: event.target.value })} /></label>
              <label>รหัสลิงก์เชิญ<input value={settings.inviteCode} onChange={(event) => setSettings({ ...settings, inviteCode: event.target.value })} /></label>
              <label className={styles.switchRow}><span>เปิดลิงก์เชิญ</span><input type="checkbox" checked={settings.inviteEnabled} onChange={(event) => setSettings({ ...settings, inviteEnabled: event.target.checked })} /></label>
              <button className={styles.primary} type="submit">บันทึก</button>
            </form>
          </div>
        )}
      </section>

      <aside className={styles.guide}><span>EDITABLE MOCKUP</span><h2>ทุกส่วนทดลองแก้ได้</h2><p>กดแก้ไขหรือลบจากรายการได้ทันที โดยยังคงแพลตฟอร์มไว้เพียง 4 ส่วนหลัก</p><ol><li>แก้ข้อมูลทริปและสมาชิก</li><li>แก้กิจกรรมและสถานที่</li><li>แก้งานและสถานะ</li><li>แก้ความทรงจำ</li></ol></aside>
    </main>
  );
}
