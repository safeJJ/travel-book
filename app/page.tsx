"use client";

import { FormEvent, useMemo, useState } from "react";

type Step = "create" | "created" | "join" | "home" | "dates" | "itinerary" | "fund" | "members" | "memories" | "checklist";
type Activity = { time: string; title: string; note: string };
type GuestRole = "สมาชิก" | "ผู้ช่วยหัวหน้าทริป";
type Memory = { emoji: string; caption: string; author: string };
type ChecklistItem = { id: number; title: string; assignee: string; done: boolean };

const avatars = ["😎", "🐻", "🐱", "🦊", "✈️", "🌴"];
const memoryEmojis = ["🏔️", "☕", "🌅", "🍜", "📸", "🌿"];
const initialActivities: Activity[] = [
  { time: "09:00", title: "คาเฟ่ริมเขา", note: "เริ่มวันแบบชิล ๆ" },
  { time: "11:30", title: "เดินเล่นย่านเมืองเก่า", note: "ถ่ายรูปและหาอาหารกลางวัน" }
];
const initialMemories: Memory[] = [
  { emoji: "🏔️", caption: "วิวแรกของทริป", author: "SafeJJ" },
  { emoji: "☕", caption: "กาแฟแก้วแรก", author: "เมย์" }
];
const initialChecklist: ChecklistItem[] = [
  { id: 1, title: "จองที่พัก", assignee: "SafeJJ", done: true },
  { id: 2, title: "เตรียมเสื้อกันหนาว", assignee: "ทุกคน", done: false },
  { id: 3, title: "เช็กรถเช่า", assignee: "เมย์", done: false }
];

export default function Page() {
  const [step, setStep] = useState<Step>("create");
  const [tripName, setTripName] = useState("แก๊งหลงทางเชียงใหม่ ✈️");
  const [destination, setDestination] = useState("เชียงใหม่");
  const [guestName, setGuestName] = useState("");
  const [avatar, setAvatar] = useState("😎");
  const [guestRole, setGuestRole] = useState<GuestRole>("สมาชิก");
  const [financePermission, setFinancePermission] = useState(false);
  const [planPermission, setPlanPermission] = useState(false);
  const [copied, setCopied] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [activityTitle, setActivityTitle] = useState("");
  const [activityTime, setActivityTime] = useState("14:00");
  const [announcement, setAnnouncement] = useState("อย่าลืมเตรียมเสื้อกันหนาวนะทุกคน!");
  const [draftAnnouncement, setDraftAnnouncement] = useState("");
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [memoryEmoji, setMemoryEmoji] = useState("🌅");
  const [memoryCaption, setMemoryCaption] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [newTask, setNewTask] = useState("");
  const [newAssignee, setNewAssignee] = useState("ทุกคน");

  const members = useMemo(() => [
    { name: "SafeJJ", avatar: "👑", role: "หัวหน้าทริป", detail: "จัดการทริปทั้งหมด" },
    ...(guestName ? [{
      name: guestName,
      avatar,
      role: guestRole,
      detail: guestRole === "ผู้ช่วยหัวหน้าทริป"
        ? [financePermission && "ดูแลการเงิน", planPermission && "ดูแลแผน"].filter(Boolean).join(" · ") || "ยังไม่ได้รับสิทธิ์เพิ่มเติม"
        : "ร่วมวางแผนและดูข้อมูลทริป"
    }] : [])
  ], [guestName, avatar, guestRole, financePermission, planPermission]);

  const dateLabel = startDate && endDate ? `${startDate} – ${endDate}` : "ยังไม่ได้เลือกวัน";
  const completedTasks = checklist.filter((item) => item.done).length;

  function createTrip(event: FormEvent) {
    event.preventDefault();
    if (!tripName.trim() || !destination.trim()) return;
    setStep("created");
  }

  async function copyInvite() {
    await navigator.clipboard?.writeText("https://travel-book.example/join/chiang-mai");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function joinTrip(event: FormEvent) {
    event.preventDefault();
    if (!guestName.trim()) return;
    setStep("home");
  }

  function saveDates(event: FormEvent) {
    event.preventDefault();
    if (!startDate || !endDate) return;
    setStep("home");
  }

  function addActivity(event: FormEvent) {
    event.preventDefault();
    if (!activityTitle.trim()) return;
    setActivities((items) => [...items, { time: activityTime, title: activityTitle.trim(), note: "เพิ่มโดยสมาชิก" }]);
    setActivityTitle("");
  }

  function addMemory(event: FormEvent) {
    event.preventDefault();
    if (!memoryCaption.trim()) return;
    setMemories((items) => [...items, { emoji: memoryEmoji, caption: memoryCaption.trim(), author: guestName || "SafeJJ" }]);
    setMemoryCaption("");
  }

  function publishAnnouncement(event: FormEvent) {
    event.preventDefault();
    if (!draftAnnouncement.trim()) return;
    setAnnouncement(draftAnnouncement.trim());
    setDraftAnnouncement("");
  }

  function addChecklistItem(event: FormEvent) {
    event.preventDefault();
    if (!newTask.trim()) return;
    setChecklist((items) => [...items, { id: Date.now(), title: newTask.trim(), assignee: newAssignee, done: false }]);
    setNewTask("");
  }

  function toggleChecklistItem(id: number) {
    setChecklist((items) => items.map((item) => item.id === id ? { ...item, done: !item.done } : item));
  }

  function toggleAssistant() {
    setGuestRole((role) => {
      if (role === "ผู้ช่วยหัวหน้าทริป") {
        setFinancePermission(false);
        setPlanPermission(false);
        return "สมาชิก";
      }
      return "ผู้ช่วยหัวหน้าทริป";
    });
  }

  const bottomNav = (
    <nav className="bottomNav" aria-label="เมนูหลัก">
      <button className={step === "home" ? "active" : ""} type="button" onClick={() => setStep("home")}>⌂<small>หน้าหลัก</small></button>
      <button className={step === "itinerary" ? "active" : ""} type="button" onClick={() => setStep("itinerary")}>▤<small>ตาราง</small></button>
      <button className="addButton" type="button" onClick={() => setStep("checklist")}>＋</button>
      <button className={step === "fund" ? "active" : ""} type="button" onClick={() => setStep("fund")}>฿<small>การเงิน</small></button>
      <button className={step === "memories" ? "active" : ""} type="button" onClick={() => setStep("memories")}>▧<small>สมุดทริป</small></button>
    </nav>
  );

  return (
    <main className="shell">
      <section className="phone" aria-live="polite">
        {step === "create" && (
          <form className="screen" onSubmit={createTrip}>
            <header className="topbar"><span className="eyebrow">TRAVEL BOOK</span><button className="iconButton" type="button">•••</button></header>
            <div className="heroTape">เริ่มทริปใหม่</div>
            <h1>ทริปดี ๆ เริ่มจากชื่อที่จำได้</h1>
            <p className="lead">สร้างให้เสร็จในไม่กี่วินาที แล้วค่อยชวนเพื่อนมาช่วยกันวางแผน</p>
            <label>ชื่อทริป<input value={tripName} onChange={(event) => setTripName(event.target.value)} maxLength={40} /></label>
            <label>จุดหมาย<input value={destination} onChange={(event) => setDestination(event.target.value)} maxLength={50} /></label>
            <button className="coverPicker" type="button"><span className="coverEmoji">🏔️</span><span><strong>เพิ่มรูปปก</strong><small>ข้ามก่อนได้</small></span><span>＋</span></button>
            <button className="primary" type="submit">สร้างทริป</button>
          </form>
        )}

        {step === "created" && (
          <div className="screen celebration">
            <div className="stamp">พร้อมแล้ว!</div><div className="coverCard"><span>🏔️</span><small>{destination}</small></div>
            <h1>{tripName}</h1><p className="lead">ตอนนี้มีคุณเป็นหัวหน้าทริป ชวนเพื่อนเข้ามาจัดวันและตารางด้วยกันได้เลย</p>
            <div className="inviteCard"><span className="miniLabel">ลิงก์เชิญ</span><p>ทุกคนที่มีลิงก์เข้าร่วมได้ทันที</p><button className="secondary" type="button" onClick={copyInvite}>{copied ? "คัดลอกแล้ว ✓" : "คัดลอกลิงก์"}</button></div>
            <button className="primary" type="button" onClick={() => setStep("join")}>จำลองเพื่อนเปิดลิงก์</button>
            <button className="textButton" type="button" onClick={() => setStep("home")}>ข้ามไปดูหน้าหลัก</button>
          </div>
        )}

        {step === "join" && (
          <form className="screen" onSubmit={joinTrip}>
            <button className="back" type="button" onClick={() => setStep("created")}>← กลับ</button><div className="coverMini">🏔️</div>
            <span className="eyebrow">คุณได้รับคำเชิญ</span><h1>{tripName}</h1><p className="lead">SafeJJ ชวนคุณมาร่วมวางแผนทริปไป{destination}</p>
            <label>เพื่อน ๆ เรียกคุณว่าอะไร?<input placeholder="กรอกชื่อเล่น" value={guestName} onChange={(event) => setGuestName(event.target.value)} autoFocus /></label>
            <fieldset><legend>เลือกรูปประจำตัว</legend><div className="avatarGrid">{avatars.map((item) => <button className={avatar === item ? "avatar selected" : "avatar"} type="button" key={item} onClick={() => setAvatar(item)}>{item}</button>)}</div></fieldset>
            <button className="primary" type="submit">เข้าร่วมทริป</button><p className="hint">ไม่ต้องสมัครสมาชิก</p>
          </form>
        )}

        {step === "home" && (
          <div className="screen homeScreen">
            <header className="tripHero"><div className="heroActions"><button type="button">↗</button><button type="button">•••</button></div><div className="destinationBadge">{destination}</div><h1>{tripName}</h1><p className="heroDate">{dateLabel}</p><div className="memberStack">{members.map((member) => <span title={`${member.name} · ${member.role}`} key={member.name}>{member.avatar}</span>)}<small>{members.length} คน</small></div></header>
            <section><div className="sectionHeading"><h2>สิ่งที่ต้องทำต่อ</h2><span>{startDate ? "2 งาน" : "3 งาน"}</span></div>
              {!startDate && <button className="taskCard" type="button" onClick={() => setStep("dates")}><span className="taskIcon">📅</span><span><strong>เลือกวันเดินทาง</strong><small>ยังไม่ได้กำหนดวัน</small></span><b>›</b></button>}
              <button className="taskCard" type="button" onClick={() => setStep("itinerary")}><span className="taskIcon">🗺️</span><span><strong>จัดตาราง{destination}</strong><small>{activities.length} กิจกรรม</small></span><b>›</b></button>
              <button className="taskCard" type="button" onClick={() => setStep("checklist")}><span className="taskIcon">✅</span><span><strong>เตรียมของและแบ่งงาน</strong><small>เสร็จแล้ว {completedTasks}/{checklist.length} งาน</small></span><b>›</b></button>
            </section>
            <section><div className="sectionHeading"><h2>ทางลัด</h2></div><div className="shortcutGrid">
              <button type="button" onClick={() => setStep("itinerary")}><span>🗓️</span><strong>ตาราง</strong><small>{activities.length} กิจกรรม</small></button>
              <button type="button" onClick={() => setStep("fund")}><span>💰</span><strong>กองกลาง</strong><small>10,300 บาท</small></button>
              <button type="button" onClick={() => setStep("members")}><span>👥</span><strong>สมาชิก</strong><small>{members.length} คน</small></button>
              <button type="button" onClick={() => setStep("memories")}><span>📸</span><strong>สมุดทริป</strong><small>{memories.length} เรื่องราว</small></button>
            </div></section>
            <section className="announcementCard"><div><span className="miniLabel">ประกาศล่าสุด</span><p>{announcement}</p><small>โดย SafeJJ · หัวหน้าทริป</small></div><span>📌</span></section>
            <form className="announcementForm" onSubmit={publishAnnouncement}><input placeholder="เขียนประกาศสั้น ๆ" value={draftAnnouncement} onChange={(event) => setDraftAnnouncement(event.target.value)} /><button type="submit">ประกาศ</button></form>
            {bottomNav}
          </div>
        )}

        {step === "dates" && (
          <form className="screen subScreen" onSubmit={saveDates}><button className="back" type="button" onClick={() => setStep("home")}>← หน้าหลัก</button><span className="eyebrow">STEP 01</span><h1>เลือกวันเดินทาง</h1><p className="lead">กำหนดวันเริ่มและวันกลับก่อน แล้วทุกคนค่อยช่วยกันเติมตารางได้</p><label>วันเริ่ม<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>วันกลับ<input type="date" value={endDate} min={startDate} onChange={(event) => setEndDate(event.target.value)} /></label><div className="paperNote">📌 หลังบันทึก สมาชิกทุกคนจะเห็นวันเดียวกันบนหน้าหลัก</div><button className="primary" type="submit">บันทึกวันเดินทาง</button></form>
        )}

        {step === "itinerary" && (
          <div className="screen homeScreen"><header className="simpleHeader"><button className="back" type="button" onClick={() => setStep("home")}>←</button><div><span className="eyebrow">ตารางเดินทาง</span><h2>วันที่ 1 · {destination}</h2></div></header><div className="dayTabs"><button className="selectedDay">วันที่ 1</button><button>วันที่ 2</button><button>＋</button></div><div className="timeline">{activities.map((item, index) => <article className="timelineItem" key={`${item.time}-${index}`}><time>{item.time}</time><div><strong>{item.title}</strong><small>{item.note}</small></div><button type="button">•••</button></article>)}</div><form className="inlineAdd" onSubmit={addActivity}><input type="time" value={activityTime} onChange={(event) => setActivityTime(event.target.value)} /><input placeholder="เพิ่มกิจกรรมใหม่" value={activityTitle} onChange={(event) => setActivityTitle(event.target.value)} /><button type="submit">เพิ่ม</button></form>{bottomNav}</div>
        )}

        {step === "fund" && (
          <div className="screen homeScreen"><header className="simpleHeader"><button className="back" type="button" onClick={() => setStep("home")}>←</button><div><span className="eyebrow">เงินกองกลาง</span><h2>บัญชีเดียวของทริป</h2></div></header><section className="fundSummary"><small>ยอดคงเหลือ</small><strong>10,300 บาท</strong><div><span>เงินเข้าทั้งหมด<br/><b>20,000</b></span><span>ใช้ไปแล้ว<br/><b>9,700</b></span></div></section><div className="sectionHeading"><h2>รายการล่าสุด</h2><span>ทุกคนดูได้</span></div><div className="expenseList"><article><span>🍜</span><div><strong>อาหารกลางวัน</strong><small>วันนี้ · โดย เมย์</small></div><b>1,200</b></article><article><span>🏨</span><div><strong>ค่าที่พัก 2 คืน</strong><small>เมื่อวาน · โดย เมย์</small></div><b>6,000</b></article><article><span>🚐</span><div><strong>ค่าเช่ารถ</strong><small>เมื่อวาน · โดย เมย์</small></div><b>2,500</b></article></div><div className="paperNote">{financePermission && guestName ? `${guestName} เป็นผู้ดูแลการเงินและเป็นคนบันทึกรายการ` : "ยังไม่ได้แต่งตั้งผู้ดูแลการเงิน"}</div>{bottomNav}</div>
        )}

        {step === "members" && (
          <div className="screen homeScreen"><header className="simpleHeader"><button className="back" type="button" onClick={() => setStep("home")}>←</button><div><span className="eyebrow">สมาชิกและบทบาท</span><h2>{members.length} คนในทริป</h2></div></header><div className="expenseList">{members.map((member) => <article key={member.name}><span>{member.avatar}</span><div><strong>{member.name}</strong><small>{member.role}<br/>{member.detail}</small></div><b>{member.role === "หัวหน้าทริป" ? "👑" : member.role === "ผู้ช่วยหัวหน้าทริป" ? "⭐" : ""}</b></article>)}</div>{!guestName && <div className="paperNote">จำลองเพื่อนเข้าร่วมก่อน จึงจะทดลองแต่งตั้งผู้ช่วยได้</div>}{guestName && <section className="inviteCard"><span className="miniLabel">จัดการ {guestName}</span><p>หัวหน้าทริปเลือกบทบาทและสิทธิ์เป็นรายคนได้</p><button className="secondary" type="button" onClick={toggleAssistant}>{guestRole === "ผู้ช่วยหัวหน้าทริป" ? "ถอดตำแหน่งผู้ช่วย" : "แต่งตั้งเป็นผู้ช่วย"}</button>{guestRole === "ผู้ช่วยหัวหน้าทริป" && <div className="permissionList"><label><span>ดูแลแผนเดินทาง</span><input type="checkbox" checked={planPermission} onChange={(event) => setPlanPermission(event.target.checked)} /></label><label><span>ดูแลเงินกองกลาง</span><input type="checkbox" checked={financePermission} onChange={(event) => setFinancePermission(event.target.checked)} /></label></div>}</section>}<div className="paperNote">🔒 ชื่อทริป รูปปก การโอนหัวหน้า และการลบทริปยังเป็นสิทธิ์ของหัวหน้าทริปเท่านั้น</div>{bottomNav}</div>
        )}

        {step === "memories" && (
          <div className="screen homeScreen"><header className="simpleHeader"><button className="back" type="button" onClick={() => setStep("home")}>←</button><div><span className="eyebrow">สมุดทริป</span><h2>{memories.length} เรื่องราวของพวกเรา</h2></div></header><div className="memoryGrid">{memories.map((memory, index) => <article className="polaroid" key={`${memory.caption}-${index}`}><div>{memory.emoji}</div><strong>{memory.caption}</strong><small>โดย {memory.author}</small></article>)}</div><form className="memoryForm" onSubmit={addMemory}><fieldset><legend>เลือกภาพจำลอง</legend><div className="avatarGrid">{memoryEmojis.map((item) => <button className={memoryEmoji === item ? "avatar selected" : "avatar"} type="button" key={item} onClick={() => setMemoryEmoji(item)}>{item}</button>)}</div></fieldset><label>คำบรรยาย<input placeholder="วันนี้มีอะไรน่าจำ?" value={memoryCaption} onChange={(event) => setMemoryCaption(event.target.value)} /></label><button className="primary" type="submit">เพิ่มลงสมุดทริป</button></form><div className="paperNote">Prototype ใช้อีโมจิแทนรูปจริง รอบระบบจริงจะรองรับการอัปโหลดรูปจากมือถือ</div>{bottomNav}</div>
        )}

        {step === "checklist" && (
          <div className="screen homeScreen">
            <header className="simpleHeader"><button className="back" type="button" onClick={() => setStep("home")}>←</button><div><span className="eyebrow">เช็กลิสต์และงาน</span><h2>เสร็จแล้ว {completedTasks}/{checklist.length} งาน</h2></div></header>
            <section className="fundSummary"><small>ความพร้อมของทริป</small><strong>{checklist.length ? Math.round((completedTasks / checklist.length) * 100) : 0}%</strong><div><span>เสร็จแล้ว<br/><b>{completedTasks}</b></span><span>ยังเหลือ<br/><b>{checklist.length - completedTasks}</b></span></div></section>
            <div className="sectionHeading"><h2>งานทั้งหมด</h2><span>ทุกคนช่วยกันได้</span></div>
            <div className="expenseList">
              {checklist.map((item) => (
                <article key={item.id}>
                  <button type="button" onClick={() => toggleChecklistItem(item.id)} style={{ width: 44, height: 44, border: 0, borderRadius: 14, background: item.done ? "#dfeedd" : "var(--soft)", fontSize: 22 }}>{item.done ? "✓" : "○"}</button>
                  <div><strong style={{ textDecoration: item.done ? "line-through" : "none", opacity: item.done ? .55 : 1 }}>{item.title}</strong><small>รับผิดชอบโดย {item.assignee}</small></div>
                  <b>{item.done ? "เสร็จ" : "รอ"}</b>
                </article>
              ))}
            </div>
            <form className="inviteCard" onSubmit={addChecklistItem}>
              <span className="miniLabel">เพิ่มงานใหม่</span>
              <label>งาน<input placeholder="เช่น จองตั๋วรถ" value={newTask} onChange={(event) => setNewTask(event.target.value)} /></label>
              <label>ผู้รับผิดชอบ<select value={newAssignee} onChange={(event) => setNewAssignee(event.target.value)} style={{ width: "100%", border: "1.5px solid var(--line)", borderRadius: 16, padding: "15px 16px", background: "white" }}><option>ทุกคน</option><option>SafeJJ</option>{guestName && <option>{guestName}</option>}</select></label>
              <button className="secondary" type="submit">เพิ่มลงเช็กลิสต์</button>
            </form>
            <div className="paperNote">แตะวงกลมหน้าแต่ละงานเพื่อเปลี่ยนสถานะ ทุกคนจะเห็นความคืบหน้าเดียวกันเมื่อเชื่อมฐานข้อมูลจริง</div>
            {bottomNav}
          </div>
        )}
      </section>

      <aside className="prototypeNotes"><span className="eyebrow">PROTOTYPE 05</span><h2>เตรียมทริปเป็นทีม</h2><ol><li>เปิดเช็กลิสต์จากหน้าหลักหรือปุ่มบวก</li><li>เพิ่มงานที่ต้องเตรียม</li><li>มอบหมายให้สมาชิก</li><li>แตะทำเครื่องหมายเมื่อเสร็จ</li></ol><p>ข้อมูลยังอยู่ในหน่วยความจำของเบราว์เซอร์ เพื่อปรับ UX ให้ลงตัวก่อนเชื่อมฐานข้อมูล</p><button className="reset" type="button" onClick={() => { setStep("create"); setGuestName(""); setGuestRole("สมาชิก"); setMemories(initialMemories); setChecklist(initialChecklist); }}>เริ่มทดลองใหม่</button></aside>
    </main>
  );
}
