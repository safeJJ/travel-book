"use client";

import { FormEvent, useMemo, useState } from "react";

type Step = "create" | "created" | "join" | "home" | "dates" | "itinerary" | "fund" | "members";
type Activity = { time: string; title: string; note: string };
type GuestRole = "สมาชิก" | "ผู้ช่วยหัวหน้าทริป";

const avatars = ["😎", "🐻", "🐱", "🦊", "✈️", "🌴"];
const initialActivities: Activity[] = [
  { time: "09:00", title: "คาเฟ่ริมเขา", note: "เริ่มวันแบบชิล ๆ" },
  { time: "11:30", title: "เดินเล่นย่านเมืองเก่า", note: "ถ่ายรูปและหาอาหารกลางวัน" }
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
      <button className="addButton" type="button" onClick={() => setStep("itinerary")}>＋</button>
      <button className={step === "fund" ? "active" : ""} type="button" onClick={() => setStep("fund")}>฿<small>การเงิน</small></button>
      <button type="button">▧<small>สมุดทริป</small></button>
    </nav>
  );

  return (
    <main className="shell">
      <section className="phone" aria-live="polite">
        {step === "create" && (
          <form className="screen" onSubmit={createTrip}>
            <header className="topbar"><span className="eyebrow">TRAVEL BOOK</span><button className="iconButton" type="button" aria-label="เมนู">•••</button></header>
            <div className="heroTape">เริ่มทริปใหม่</div>
            <h1>ทริปดี ๆ เริ่มจากชื่อที่จำได้</h1>
            <p className="lead">สร้างให้เสร็จในไม่กี่วินาที แล้วค่อยชวนเพื่อนมาช่วยกันวางแผน</p>
            <label>ชื่อทริป<input value={tripName} onChange={(event) => setTripName(event.target.value)} maxLength={40} /></label>
            <label>จุดหมาย<input value={destination} onChange={(event) => setDestination(event.target.value)} maxLength={50} /></label>
            <button className="coverPicker" type="button"><span className="coverEmoji">🏔️</span><span><strong>เพิ่มรูปปก</strong><small>ข้ามก่อนได้</small></span><span>＋</span></button>
            <button className="primary" type="submit">สร้างทริป</button>
            <p className="hint">กรอกเพียงชื่อทริปและจุดหมายก่อน</p>
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
            <section><div className="sectionHeading"><h2>สิ่งที่ต้องทำต่อ</h2><span>{startDate ? "1 งาน" : "2 งาน"}</span></div>
              {!startDate && <button className="taskCard" type="button" onClick={() => setStep("dates")}><span className="taskIcon">📅</span><span><strong>เลือกวันเดินทาง</strong><small>ยังไม่ได้กำหนดวัน</small></span><b>›</b></button>}
              <button className="taskCard" type="button" onClick={() => setStep("itinerary")}><span className="taskIcon">🗺️</span><span><strong>จัดตาราง{destination}</strong><small>{activities.length} กิจกรรม</small></span><b>›</b></button>
            </section>
            <section><div className="sectionHeading"><h2>ทางลัด</h2></div><div className="shortcutGrid">
              <button type="button" onClick={() => setStep("itinerary")}><span>🗓️</span><strong>ตาราง</strong><small>{activities.length} กิจกรรม</small></button>
              <button type="button" onClick={() => setStep("fund")}><span>💰</span><strong>กองกลาง</strong><small>10,300 บาท</small></button>
              <button type="button" onClick={() => setStep("members")}><span>👥</span><strong>สมาชิก</strong><small>{members.length} คน</small></button>
              <button type="button"><span>📸</span><strong>สมุดทริป</strong><small>เริ่มเก็บเรื่องราว</small></button>
            </div></section>{bottomNav}
          </div>
        )}

        {step === "dates" && (
          <form className="screen subScreen" onSubmit={saveDates}><button className="back" type="button" onClick={() => setStep("home")}>← หน้าหลัก</button><span className="eyebrow">STEP 01</span><h1>เลือกวันเดินทาง</h1><p className="lead">กำหนดวันเริ่มและวันกลับก่อน แล้วทุกคนค่อยช่วยกันเติมตารางได้</p><label>วันเริ่ม<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>วันกลับ<input type="date" value={endDate} min={startDate} onChange={(event) => setEndDate(event.target.value)} /></label><div className="paperNote">📌 หลังบันทึก สมาชิกทุกคนจะเห็นวันเดียวกันบนหน้าหลัก</div><button className="primary" type="submit">บันทึกวันเดินทาง</button></form>
        )}

        {step === "itinerary" && (
          <div className="screen homeScreen"><header className="simpleHeader"><button className="back" type="button" onClick={() => setStep("home")}>←</button><div><span className="eyebrow">ตารางเดินทาง</span><h2>วันที่ 1 · {destination}</h2></div></header><div className="dayTabs"><button className="selectedDay">วันที่ 1</button><button>วันที่ 2</button><button>＋</button></div><div className="timeline">{activities.map((item, index) => <article className="timelineItem" key={`${item.time}-${index}`}><time>{item.time}</time><div><strong>{item.title}</strong><small>{item.note}</small></div><button type="button" aria-label="แก้ไข">•••</button></article>)}</div><form className="inlineAdd" onSubmit={addActivity}><input type="time" value={activityTime} onChange={(event) => setActivityTime(event.target.value)} /><input placeholder="เพิ่มกิจกรรมใหม่" value={activityTitle} onChange={(event) => setActivityTitle(event.target.value)} /><button type="submit">เพิ่ม</button></form>{bottomNav}</div>
        )}

        {step === "fund" && (
          <div className="screen homeScreen"><header className="simpleHeader"><button className="back" type="button" onClick={() => setStep("home")}>←</button><div><span className="eyebrow">เงินกองกลาง</span><h2>บัญชีเดียวของทริป</h2></div></header><section className="fundSummary"><small>ยอดคงเหลือ</small><strong>10,300 บาท</strong><div><span>เงินเข้าทั้งหมด<br/><b>20,000</b></span><span>ใช้ไปแล้ว<br/><b>9,700</b></span></div></section><div className="sectionHeading"><h2>รายการล่าสุด</h2><span>ทุกคนดูได้</span></div><div className="expenseList"><article><span>🍜</span><div><strong>อาหารกลางวัน</strong><small>วันนี้ · โดย เมย์</small></div><b>1,200</b></article><article><span>🏨</span><div><strong>ค่าที่พัก 2 คืน</strong><small>เมื่อวาน · โดย เมย์</small></div><b>6,000</b></article><article><span>🚐</span><div><strong>ค่าเช่ารถ</strong><small>เมื่อวาน · โดย เมย์</small></div><b>2,500</b></article></div><div className="paperNote">{financePermission && guestName ? `${guestName} เป็นผู้ดูแลการเงินและเป็นคนบันทึกรายการ` : "ยังไม่ได้แต่งตั้งผู้ดูแลการเงิน"}</div>{bottomNav}</div>
        )}

        {step === "members" && (
          <div className="screen homeScreen">
            <header className="simpleHeader"><button className="back" type="button" onClick={() => setStep("home")}>←</button><div><span className="eyebrow">สมาชิกและบทบาท</span><h2>{members.length} คนในทริป</h2></div></header>
            <div className="expenseList">
              {members.map((member) => <article key={member.name}><span>{member.avatar}</span><div><strong>{member.name}</strong><small>{member.role}<br/>{member.detail}</small></div><b>{member.role === "หัวหน้าทริป" ? "👑" : member.role === "ผู้ช่วยหัวหน้าทริป" ? "⭐" : ""}</b></article>)}
            </div>

            {!guestName && <div className="paperNote">จำลองเพื่อนเข้าร่วมก่อน จึงจะทดลองแต่งตั้งผู้ช่วยได้</div>}

            {guestName && (
              <section className="inviteCard">
                <span className="miniLabel">จัดการ {guestName}</span>
                <p>หัวหน้าทริปเลือกบทบาทและสิทธิ์เป็นรายคนได้</p>
                <button className="secondary" type="button" onClick={toggleAssistant}>{guestRole === "ผู้ช่วยหัวหน้าทริป" ? "ถอดตำแหน่งผู้ช่วย" : "แต่งตั้งเป็นผู้ช่วย"}</button>
                {guestRole === "ผู้ช่วยหัวหน้าทริป" && (
                  <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: 0, padding: 12, border: "1px solid var(--line)", borderRadius: 14 }}>
                      <span>ดูแลแผนเดินทาง</span><input style={{ width: 22, height: 22 }} type="checkbox" checked={planPermission} onChange={(event) => setPlanPermission(event.target.checked)} />
                    </label>
                    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: 0, padding: 12, border: "1px solid var(--line)", borderRadius: 14 }}>
                      <span>ดูแลเงินกองกลาง</span><input style={{ width: 22, height: 22 }} type="checkbox" checked={financePermission} onChange={(event) => setFinancePermission(event.target.checked)} />
                    </label>
                  </div>
                )}
              </section>
            )}

            <div className="paperNote">🔒 ชื่อทริป รูปปก การโอนหัวหน้า และการลบทริปยังเป็นสิทธิ์ของหัวหน้าทริปเท่านั้น</div>
            {bottomNav}
          </div>
        )}
      </section>

      <aside className="prototypeNotes">
        <span className="eyebrow">PROTOTYPE 03</span><h2>ทดลองบทบาทร่วมกัน</h2>
        <ol><li>สร้างทริปและจำลองเพื่อนเข้าร่วม</li><li>เปิดทางลัด “สมาชิก”</li><li>แต่งตั้งเพื่อนเป็นผู้ช่วยหัวหน้าทริป</li><li>เลือกสิทธิ์ดูแลแผนหรือเงินกองกลาง</li></ol>
        <p>ข้อมูลยังเป็นสถานะจำลองในเบราว์เซอร์ เพื่อทดสอบความเข้าใจของหน้าจอก่อนทำระบบจริง</p>
        <button className="reset" type="button" onClick={() => { setStep("create"); setGuestName(""); setGuestRole("สมาชิก"); setFinancePermission(false); setPlanPermission(false); }}>เริ่มทดลองใหม่</button>
      </aside>
    </main>
  );
}
