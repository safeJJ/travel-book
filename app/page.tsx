"use client";

import { FormEvent, useMemo, useState } from "react";

type Step = "create" | "created" | "join" | "home";

const avatars = ["😎", "🐻", "🐱", "🦊", "✈️", "🌴"];

export default function Page() {
  const [step, setStep] = useState<Step>("create");
  const [tripName, setTripName] = useState("แก๊งหลงทางเชียงใหม่ ✈️");
  const [destination, setDestination] = useState("เชียงใหม่");
  const [guestName, setGuestName] = useState("");
  const [avatar, setAvatar] = useState("😎");
  const [copied, setCopied] = useState(false);

  const members = useMemo(() => [
    { name: "SafeJJ", avatar: "👑", role: "หัวหน้าทริป" },
    ...(guestName ? [{ name: guestName, avatar, role: "สมาชิก" }] : [])
  ], [guestName, avatar]);

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

  return (
    <main className="shell">
      <section className="phone" aria-live="polite">
        {step === "create" && (
          <form className="screen" onSubmit={createTrip}>
            <header className="topbar">
              <span className="eyebrow">TRAVEL BOOK</span>
              <button className="iconButton" type="button" aria-label="เมนู">•••</button>
            </header>

            <div className="heroTape">เริ่มทริปใหม่</div>
            <h1>ทริปดี ๆ เริ่มจากชื่อที่จำได้</h1>
            <p className="lead">สร้างให้เสร็จในไม่กี่วินาที แล้วค่อยชวนเพื่อนมาช่วยกันวางแผน</p>

            <label>
              ชื่อทริป
              <input value={tripName} onChange={(event) => setTripName(event.target.value)} maxLength={40} />
            </label>

            <label>
              จุดหมาย
              <input value={destination} onChange={(event) => setDestination(event.target.value)} maxLength={50} />
            </label>

            <button className="coverPicker" type="button">
              <span className="coverEmoji">🏔️</span>
              <span><strong>เพิ่มรูปปก</strong><small>ข้ามก่อนได้</small></span>
              <span>＋</span>
            </button>

            <button className="primary" type="submit">สร้างทริป</button>
            <p className="hint">กรอกเพียงชื่อทริปและจุดหมายก่อน</p>
          </form>
        )}

        {step === "created" && (
          <div className="screen celebration">
            <div className="stamp">พร้อมแล้ว!</div>
            <div className="coverCard">
              <span>🏔️</span>
              <small>{destination}</small>
            </div>
            <h1>{tripName}</h1>
            <p className="lead">ตอนนี้มีคุณเป็นหัวหน้าทริป ชวนเพื่อนเข้ามาจัดวันและตารางด้วยกันได้เลย</p>

            <div className="inviteCard">
              <span className="miniLabel">ลิงก์เชิญ</span>
              <p>ทุกคนที่มีลิงก์เข้าร่วมได้ทันที</p>
              <button className="secondary" type="button" onClick={copyInvite}>{copied ? "คัดลอกแล้ว ✓" : "คัดลอกลิงก์"}</button>
            </div>

            <button className="primary" type="button" onClick={() => setStep("join")}>จำลองเพื่อนเปิดลิงก์</button>
            <button className="textButton" type="button" onClick={() => setStep("home")}>ข้ามไปดูหน้าหลัก</button>
          </div>
        )}

        {step === "join" && (
          <form className="screen" onSubmit={joinTrip}>
            <button className="back" type="button" onClick={() => setStep("created")}>← กลับ</button>
            <div className="coverMini">🏔️</div>
            <span className="eyebrow">คุณได้รับคำเชิญ</span>
            <h1>{tripName}</h1>
            <p className="lead">SafeJJ ชวนคุณมาร่วมวางแผนทริปไป{destination}</p>

            <label>
              เพื่อน ๆ เรียกคุณว่าอะไร?
              <input placeholder="กรอกชื่อเล่น" value={guestName} onChange={(event) => setGuestName(event.target.value)} autoFocus />
            </label>

            <fieldset>
              <legend>เลือกรูปประจำตัว</legend>
              <div className="avatarGrid">
                {avatars.map((item) => (
                  <button className={avatar === item ? "avatar selected" : "avatar"} type="button" key={item} onClick={() => setAvatar(item)}>{item}</button>
                ))}
              </div>
            </fieldset>

            <button className="primary" type="submit">เข้าร่วมทริป</button>
            <p className="hint">ไม่ต้องสมัครสมาชิก</p>
          </form>
        )}

        {step === "home" && (
          <div className="screen homeScreen">
            <header className="tripHero">
              <div className="heroActions"><button type="button">↗</button><button type="button">•••</button></div>
              <div className="destinationBadge">{destination}</div>
              <h1>{tripName}</h1>
              <div className="memberStack">
                {members.map((member) => <span title={`${member.name} · ${member.role}`} key={member.name}>{member.avatar}</span>)}
                <small>{members.length} คน</small>
              </div>
            </header>

            <section>
              <div className="sectionHeading"><h2>สิ่งที่ต้องทำต่อ</h2><span>2 งาน</span></div>
              <button className="taskCard" type="button">
                <span className="taskIcon">📅</span><span><strong>เลือกวันเดินทาง</strong><small>ยังไม่ได้กำหนดวัน</small></span><b>›</b>
              </button>
              <button className="taskCard" type="button">
                <span className="taskIcon">🗺️</span><span><strong>เริ่มจัดตาราง{destination}</strong><small>ยังไม่มีกิจกรรม</small></span><b>›</b>
              </button>
            </section>

            <section>
              <div className="sectionHeading"><h2>ทางลัด</h2></div>
              <div className="shortcutGrid">
                <button type="button"><span>🗓️</span><strong>ตาราง</strong><small>ยังไม่เริ่ม</small></button>
                <button type="button"><span>💰</span><strong>กองกลาง</strong><small>฿0</small></button>
                <button type="button"><span>👥</span><strong>สมาชิก</strong><small>{members.length} คน</small></button>
                <button type="button"><span>📸</span><strong>สมุดทริป</strong><small>เริ่มเก็บเรื่องราว</small></button>
              </div>
            </section>

            <nav className="bottomNav" aria-label="เมนูหลัก">
              <button className="active" type="button">⌂<small>หน้าหลัก</small></button>
              <button type="button">▤<small>ตาราง</small></button>
              <button className="addButton" type="button">＋</button>
              <button type="button">฿<small>การเงิน</small></button>
              <button type="button">▧<small>สมุดทริป</small></button>
            </nav>
          </div>
        )}
      </section>

      <aside className="prototypeNotes">
        <span className="eyebrow">PROTOTYPE 01</span>
        <h2>Flow ที่ทดลองได้</h2>
        <ol><li>สร้างทริปพร้อมจุดหมาย</li><li>คัดลอกลิงก์เชิญ</li><li>เพื่อนกรอกชื่อและเลือกอวาตาร์</li><li>เข้าสู่หน้าหลักตามสถานะ</li></ol>
        <p>รอบนี้ยังไม่บันทึกข้อมูลจริง จุดประสงค์คือทดสอบว่า Flow เข้าใจง่ายและบุคลิกของแอปตรงใจหรือไม่</p>
        <button className="reset" type="button" onClick={() => { setStep("create"); setGuestName(""); }}>เริ่มทดลองใหม่</button>
      </aside>
    </main>
  );
}
