"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { readStorage, writeStorage } from "../../lib/storage";
import { STORAGE_KEYS } from "../../lib/storage-keys";
import type { ConfirmedDates, DailyActivity, DailyPlan, TripSettings } from "../../types/trip";
import styles from "./simple-trip-platform.module.css";

type Tab = "home" | "plan" | "tasks" | "memories";
type Task = { id: number; title: string; done: boolean };
type Memory = { id: number; emoji: string; caption: string };
type Place = { id: number; emoji: string; name: string };
type Member = { id: number; avatar: string; name: string; role: string };
type IconName = "calendar" | "check" | "pin" | "book" | "users" | "edit" | "chevron" | "home" | "plan" | "tasks" | "journal" | "plus" | "more";

const defaultSettings: TripSettings = { name: "แก๊งหลงทางเชียงใหม่", destination: "เชียงใหม่", leader: "SafeJJ", inviteEnabled: true, inviteCode: "CHIANG-MAI" };
const defaultPlan: DailyPlan = { "1": [{ id: 1, time: "09:00", title: "คาเฟ่ริมเขา", note: "เริ่มวันแบบชิล ๆ" }, { id: 2, time: "11:30", title: "เดินเมืองเก่า", note: "ถ่ายรูปและหาอาหารกลางวัน" }] };
const defaultTasks: Task[] = [{ id: 1, title: "จองที่พัก", done: true }, { id: 2, title: "เตรียมเสื้อกันหนาว", done: false }, { id: 3, title: "เช็กรถเช่า", done: false }];
const defaultMemories: Memory[] = [{ id: 1, emoji: "", caption: "วิวแรกของทริป" }, { id: 2, emoji: "", caption: "กาแฟแก้วแรก" }];
const defaultPlaces: Place[] = [{ id: 1, emoji: "", name: "ประตูท่าแพ" }, { id: 2, emoji: "", name: "บ้านพักริมปิง" }, { id: 3, emoji: "", name: "ข้าวซอยแม่สาย" }];
const defaultMembers: Member[] = [{ id: 1, avatar: "SJ", name: "SafeJJ", role: "หัวหน้าทริป" }, { id: 2, avatar: "MY", name: "เมย์", role: "สมาชิก" }, { id: 3, avatar: "PN", name: "ปอนด์", role: "สมาชิก" }];

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    check: <><rect x="3" y="3" width="18" height="18" rx="5"/><path d="m8 12 3 3 5-6"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v17H6.5A2.5 2.5 0 0 0 4 22Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v17h5.5A2.5 2.5 0 0 1 20 22Z"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 15c3.1 0 5.5 2 5.5 5"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-6h6v6"/></>,
    plan: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></>,
    tasks: <><rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 11 2 2 4-5"/></>,
    journal: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18M9 8h6M9 12h6"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></>
  };
  return <svg className={styles.icon} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function getDayCount(dates: ConfirmedDates | null) {
  if (!dates) return 4;
  const start = new Date(`${dates.start}T00:00:00`);
  const end = new Date(`${dates.end}T00:00:00`);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
}

function initials(member: Member) {
  if (/^[A-Za-z]{1,3}$/.test(member.avatar)) return member.avatar.toUpperCase();
  if (member.name === "เมย์") return "MY";
  if (member.name === "ปอนด์") return "PN";
  return member.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || member.name.slice(0, 2);
}

function ask(label: string, currentValue: string) { return window.prompt(label, currentValue)?.trim() || null; }

export default function SimpleTripPlatform() {
  const [tab, setTab] = useState<Tab>("home");
  const [editMode, setEditMode] = useState(false);
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
    setEditMode(readStorage(STORAGE_KEYS.editMode, false));
  }, []);

  const totalDays = getDayCount(dates);
  const currentActivities = plan[String(activeDay)] ?? [];
  const completedTasks = tasks.filter((task) => task.done).length;
  const dateLabel = dates?.label ?? "22–25 สิงหาคม · 4 วัน 3 คืน";
  const nextAction = useMemo(() => ({ title: dates ? "เติมแผนวันถัดไป" : "เลือกวันเดินทาง", detail: dates ? `${currentActivities.length} กิจกรรมในวันที่ ${activeDay}` : "ให้ทุกคนเลือกวันที่สะดวก" }), [dates, currentActivities.length, activeDay]);

  function toggleEditMode() { const next = !editMode; setEditMode(next); writeStorage(STORAGE_KEYS.editMode, next); if (!next) setShowSettings(false); }
  function persistPlan(next: DailyPlan) { setPlan(next); writeStorage(STORAGE_KEYS.dailyItinerary, next); }
  function persistTasks(next: Task[]) { setTasks(next); writeStorage(STORAGE_KEYS.tasks, next); }
  function persistPlaces(next: Place[]) { setPlaces(next); writeStorage(STORAGE_KEYS.places, next); }
  function persistMemories(next: Memory[]) { setMemories(next); writeStorage(STORAGE_KEYS.memories, next); }
  function persistMembers(next: Member[]) { setMembers(next); writeStorage(STORAGE_KEYS.members, next); }
  function saveSettings(event: FormEvent) { event.preventDefault(); persistMembers(members.map((member) => member.role === "หัวหน้าทริป" ? { ...member, name: settings.leader } : member)); writeStorage(STORAGE_KEYS.tripSettings, settings); setShowSettings(false); }
  function addActivity(event: FormEvent) { event.preventDefault(); if (!activityTitle.trim()) return; persistPlan({ ...plan, [String(activeDay)]: [...currentActivities, { id: Date.now(), time: activityTime, title: activityTitle.trim(), note: "เพิ่มโดยสมาชิก" }] }); setActivityTitle(""); }
  function editActivity(activity: DailyActivity) { const time = ask("แก้ไขเวลา", activity.time); if (!time) return; const title = ask("แก้ไขชื่อกิจกรรม", activity.title); if (!title) return; const note = ask("แก้ไขหมายเหตุ", activity.note); if (!note) return; persistPlan({ ...plan, [String(activeDay)]: currentActivities.map((item) => item.id === activity.id ? { ...item, time, title, note } : item) }); }
  function deleteActivity(id: number) { if (window.confirm("ลบกิจกรรมนี้หรือไม่?")) persistPlan({ ...plan, [String(activeDay)]: currentActivities.filter((item) => item.id !== id) }); }
  function addTask(event: FormEvent) { event.preventDefault(); if (!taskTitle.trim()) return; persistTasks([...tasks, { id: Date.now(), title: taskTitle.trim(), done: false }]); setTaskTitle(""); }
  function toggleTask(id: number) { persistTasks(tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task)); }
  function editTask(task: Task) { const title = ask("แก้ไขงาน", task.title); if (title) persistTasks(tasks.map((item) => item.id === task.id ? { ...item, title } : item)); }
  function deleteTask(id: number) { if (window.confirm("ลบงานนี้หรือไม่?")) persistTasks(tasks.filter((task) => task.id !== id)); }
  function addMemory(event: FormEvent) { event.preventDefault(); if (!memoryCaption.trim()) return; persistMemories([...memories, { id: Date.now(), emoji: "", caption: memoryCaption.trim() }]); setMemoryCaption(""); }
  function editMemory(memory: Memory) { const caption = ask("แก้ไขข้อความ", memory.caption); if (caption) persistMemories(memories.map((item) => item.id === memory.id ? { ...item, caption } : item)); }
  function deleteMemory(id: number) { if (window.confirm("ลบความทรงจำนี้หรือไม่?")) persistMemories(memories.filter((memory) => memory.id !== id)); }
  function addPlace(event: FormEvent) { event.preventDefault(); if (!placeName.trim()) return; persistPlaces([...places, { id: Date.now(), emoji: "", name: placeName.trim() }]); setPlaceName(""); }
  function editPlace(place: Place) { const name = ask("แก้ไขชื่อสถานที่", place.name); if (name) persistPlaces(places.map((item) => item.id === place.id ? { ...item, name } : item)); }
  function deletePlace(id: number) { if (window.confirm("ลบสถานที่นี้หรือไม่?")) persistPlaces(places.filter((place) => place.id !== id)); }
  function addMember() { const name = ask("ชื่อสมาชิกใหม่", "เพื่อนใหม่"); if (!name) return; const code = ask("อักษรย่อ", name.slice(0, 2).toUpperCase()) || name.slice(0, 2); persistMembers([...members, { id: Date.now(), avatar: code, name, role: "สมาชิก" }]); }
  function editMember(member: Member) { const name = ask("แก้ไขชื่อสมาชิก", member.name); if (!name) return; const role = ask("แก้ไขบทบาท", member.role) || member.role; persistMembers(members.map((item) => item.id === member.id ? { ...item, name, role } : item)); }
  function deleteMember(member: Member) { if (member.role === "หัวหน้าทริป") return window.alert("กรุณาเปลี่ยนบทบาทหัวหน้าก่อนลบ"); if (window.confirm(`ลบ ${member.name} ออกจากทริปหรือไม่?`)) persistMembers(members.filter((item) => item.id !== member.id)); }
  async function copyInvite() { await navigator.clipboard?.writeText(`https://travel-book.example/join/${settings.inviteCode}`); setCopied(true); window.setTimeout(() => setCopied(false), 1400); }
  const controls = (onEdit: () => void, onDelete: () => void) => editMode ? <div className={styles.rowActions}><button type="button" onClick={onEdit}>แก้ไข</button><button type="button" onClick={onDelete}>ลบ</button></div> : null;

  return <main className={styles.shell}>
    <section className={styles.phone}>
      <header className={styles.hero}>
        <div className={styles.landscape}><span/><span/><span/></div>
        <div className={styles.heroTop}>
          <span className={styles.destination}><Icon name="pin" size={17}/>{settings.destination}</span>
          <div className={styles.modeControls}>
            <button className={editMode ? styles.editModeActive : ""} type="button" onClick={toggleEditMode}><Icon name="edit" size={16}/>{editMode ? "เสร็จสิ้น" : "แก้ไข"}</button>
            {editMode && <button className={styles.moreButton} type="button" onClick={() => setShowSettings(true)} aria-label="ตั้งค่าทริป"><Icon name="more" size={18}/></button>}
          </div>
        </div>
        <h1>{settings.name}</h1><p>{dateLabel}</p>
        <div className={styles.members}>{members.slice(0, 4).map((member, index) => <span className={styles[`avatar${(index % 3) + 1}`]} key={member.id} title={member.name}>{initials(member)}</span>)}<small>{members.length} คน</small></div>
      </header>

      {tab === "home" && <div className={styles.content}>
        <button className={styles.nextAction} type="button" onClick={() => dates ? setTab("plan") : window.location.assign("/date-vote")}><Icon name="calendar"/><div><small>ทำต่อ</small><strong>{nextAction.title}</strong><p>{nextAction.detail}</p></div><Icon name="chevron"/></button>
        <section className={styles.simpleSection}><div className={styles.sectionTitle}><h2>ภาพรวม</h2></div><div className={styles.summaryGrid}>
          <button type="button" onClick={() => setTab("plan")}><Icon name="calendar"/><strong>{Object.values(plan).flat().length}</strong><small>กิจกรรม</small></button>
          <button type="button" onClick={() => setTab("tasks")}><Icon name="check"/><strong>{completedTasks} / {tasks.length}</strong><small>งานเสร็จแล้ว</small></button>
          <button type="button" onClick={() => setTab("plan")}><Icon name="pin"/><strong>{places.length}</strong><small>สถานที่</small></button>
          <button type="button" onClick={() => setTab("memories")}><Icon name="book"/><strong>{memories.length}</strong><small>ความทรงจำ</small></button>
        </div></section>
        <section className={styles.simpleSection}><div className={styles.sectionTitle}><h2>เพื่อนร่วมทริป</h2><div className={styles.titleActions}><button type="button" onClick={copyInvite}>{copied ? "คัดลอกแล้ว" : "ชวนเพื่อน"}</button>{editMode && <button type="button" onClick={addMember}><Icon name="plus" size={15}/>เพิ่ม</button>}</div></div>{members.map((member, index) => <div className={styles.memberRow} key={member.id}><span className={styles[`avatar${(index % 3) + 1}`]}>{initials(member)}</span><div><strong>{member.name}</strong><small>{member.role}</small></div>{controls(() => editMember(member), () => deleteMember(member))}</div>)}</section>
      </div>}

      {tab === "plan" && <div className={styles.content}><div className={styles.pageTitle}><div><small>แผนทริป</small><h2>{settings.destination}</h2></div>{editMode ? <Link href="/date-vote">แก้วัน</Link> : <span>{dateLabel}</span>}</div><div className={styles.dayTabs}>{Array.from({ length: totalDays }, (_, index) => index + 1).map((day) => <button key={day} className={activeDay === day ? styles.activeDay : ""} type="button" onClick={() => setActiveDay(day)}>วันที่ {day}</button>)}</div><div className={styles.timeline}>{currentActivities.length === 0 ? <div className={styles.empty}>วันนี้ยังไม่มีแผน</div> : currentActivities.slice().sort((a, b) => a.time.localeCompare(b.time)).map((activity) => <article key={activity.id}><time>{activity.time}</time><div><strong>{activity.title}</strong><small>{activity.note}</small></div>{controls(() => editActivity(activity), () => deleteActivity(activity.id))}</article>)}</div>{editMode && <form className={styles.inlineForm} onSubmit={addActivity}><input type="time" value={activityTime} onChange={(event) => setActivityTime(event.target.value)}/><input placeholder="เพิ่มกิจกรรม" value={activityTitle} onChange={(event) => setActivityTitle(event.target.value)}/><button type="submit">เพิ่ม</button></form>}<section className={styles.simpleSection}><div className={styles.sectionTitle}><h2>สถานที่ที่เก็บไว้</h2></div><div className={styles.placeList}>{places.map((place) => <div key={place.id}><Icon name="pin"/><strong>{place.name}</strong>{controls(() => editPlace(place), () => deletePlace(place.id))}</div>)}</div>{editMode && <form className={styles.inlineForm} onSubmit={addPlace}><input className={styles.fullInput} placeholder="เพิ่มสถานที่" value={placeName} onChange={(event) => setPlaceName(event.target.value)}/><button type="submit">เพิ่ม</button></form>}</section></div>}

      {tab === "tasks" && <div className={styles.content}><div className={styles.pageTitle}><div><small>งานที่ต้องทำ</small><h2>{completedTasks}/{tasks.length} งานเสร็จแล้ว</h2></div></div><div className={styles.taskList}>{tasks.map((task) => <div className={styles.taskRow} key={task.id}><button className={styles.taskToggle} type="button" onClick={() => toggleTask(task.id)}><span className={task.done ? styles.doneCheck : styles.check}>{task.done ? "✓" : ""}</span><strong className={task.done ? styles.doneText : ""}>{task.title}</strong></button>{controls(() => editTask(task), () => deleteTask(task.id))}</div>)}</div>{editMode && <form className={styles.inlineForm} onSubmit={addTask}><input className={styles.fullInput} placeholder="เพิ่มงานใหม่" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)}/><button type="submit">เพิ่ม</button></form>}</div>}

      {tab === "memories" && <div className={styles.content}><div className={styles.pageTitle}><div><small>สมุดทริป</small><h2>เรื่องราวของพวกเรา</h2></div></div><div className={styles.memoryGrid}>{memories.map((memory, index) => <article key={memory.id}><div className={styles[`memoryVisual${(index % 3) + 1}`]}><Icon name="journal" size={28}/></div><strong>{memory.caption}</strong>{editMode && <div className={styles.cardActions}><button type="button" onClick={() => editMemory(memory)}>แก้ไข</button><button type="button" onClick={() => deleteMemory(memory.id)}>ลบ</button></div>}</article>)}</div>{editMode && <form className={styles.inlineForm} onSubmit={addMemory}><input className={styles.fullInput} placeholder="วันนี้มีอะไรน่าจำ?" value={memoryCaption} onChange={(event) => setMemoryCaption(event.target.value)}/><button type="submit">เพิ่ม</button></form>}</div>}

      <nav className={styles.nav} aria-label="เมนูหลัก">{([{ key: "home", label: "หน้าหลัก", icon: "home" }, { key: "plan", label: "แผนทริป", icon: "plan" }, { key: "tasks", label: "งาน", icon: "tasks" }, { key: "memories", label: "สมุดทริป", icon: "journal" }] as const).map((item) => <button key={item.key} className={tab === item.key ? styles.activeNav : ""} type="button" onClick={() => setTab(item.key)}><Icon name={item.icon}/><small>{item.label}</small></button>)}</nav>

      {showSettings && editMode && <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="ตั้งค่าทริป"><form className={styles.sheet} onSubmit={saveSettings}><div className={styles.sheetHandle}/><div className={styles.sheetTitle}><h2>ตั้งค่าทริป</h2><button type="button" onClick={() => setShowSettings(false)}>×</button></div><label>ชื่อทริป<input value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })}/></label><label>จุดหมาย<input value={settings.destination} onChange={(event) => setSettings({ ...settings, destination: event.target.value })}/></label><label>หัวหน้าทริป<input value={settings.leader} onChange={(event) => setSettings({ ...settings, leader: event.target.value })}/></label><label>รหัสลิงก์เชิญ<input value={settings.inviteCode} onChange={(event) => setSettings({ ...settings, inviteCode: event.target.value })}/></label><label className={styles.switchRow}><span>เปิดลิงก์เชิญ</span><input type="checkbox" checked={settings.inviteEnabled} onChange={(event) => setSettings({ ...settings, inviteEnabled: event.target.checked })}/></label><button className={styles.primary} type="submit">บันทึก</button></form></div>}
    </section>
    <aside className={styles.guide}><span>APPROVED DIRECTION</span><h2>Warm editorial travel platform</h2><p>หน้าเว็บจริงกำลังใช้ Design Spec จาก Figma: ไม่มีอิโมจิ ใช้ outline icons โทน ivory และ forest green พร้อมโหมดปกติและโหมดแก้ไข</p></aside>
  </main>;
}
