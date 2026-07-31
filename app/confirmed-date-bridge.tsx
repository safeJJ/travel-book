"use client";

import { useEffect } from "react";

const DATE_STORAGE_KEY = "travel-book-confirmed-dates";
const PLAN_STORAGE_KEY = "travel-book-daily-itinerary";

type ConfirmedDates = { label: string; start: string; end: string };
type DailyActivity = { id: number; time: string; title: string; note: string };
type DailyPlan = Record<string, DailyActivity[]>;

function getDayCount(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1);
}

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export default function ConfirmedDateBridge() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    function connectMainRoutes() {
      document.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
        const text = button.textContent ?? "";
        if (text.includes("กองกลาง") || text.includes("การเงิน")) {
          button.onclick = () => { window.location.href = "/fund-manager"; };
        }

        if (text.includes("เลือกวันเดินทาง") || text.includes("วันที่เดินทางยืนยันแล้ว")) {
          button.onclick = () => { window.location.href = "/date-vote"; };
        }
      });
    }

    connectMainRoutes();
    const observer = new MutationObserver(connectMainRoutes);
    observer.observe(document.body, { childList: true, subtree: true });

    const confirmed = readJson<ConfirmedDates>(DATE_STORAGE_KEY);
    const dateTask = Array.from(document.querySelectorAll<HTMLButtonElement>(".taskCard"))
      .find((button) => button.textContent?.includes("เลือกวันเดินทาง") || button.textContent?.includes("วันที่เดินทางยืนยันแล้ว"));

    if (confirmed) {
      const heroDate = document.querySelector<HTMLElement>(".heroDate");
      if (heroDate) heroDate.textContent = confirmed.label;

      if (dateTask) {
        const title = dateTask.querySelector("strong");
        if (title) title.textContent = "วันที่เดินทางยืนยันแล้ว";
        const detail = dateTask.querySelector("small");
        if (detail) detail.textContent = `${confirmed.label} · แตะเพื่อดูผล`;
      }
    }

    const tabs = document.querySelector<HTMLElement>(".dayTabs");
    const timeline = document.querySelector<HTMLElement>(".timeline");
    const addForm = document.querySelector<HTMLFormElement>(".inlineAdd");
    const itineraryTitle = Array.from(document.querySelectorAll<HTMLElement>(".simpleHeader h2"))
      .find((element) => element.textContent?.includes("วันที่ 1"));

    if (!confirmed || !tabs || !timeline || !addForm || !itineraryTitle) {
      return () => observer.disconnect();
    }

    const totalDays = getDayCount(confirmed.start, confirmed.end);
    let activeDay = 1;
    const storedPlan = readJson<DailyPlan>(PLAN_STORAGE_KEY);
    const plan: DailyPlan = storedPlan ?? {
      "1": [
        { id: 1, time: "09:00", title: "คาเฟ่ริมเขา", note: "เริ่มวันแบบชิล ๆ" },
        { id: 2, time: "11:30", title: "เดินเล่นย่านเมืองเก่า", note: "ถ่ายรูปและหาอาหารกลางวัน" }
      ]
    };

    for (let day = 1; day <= totalDays; day += 1) {
      if (!plan[String(day)]) plan[String(day)] = [];
    }

    function savePlan() {
      window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
    }

    function renderTimeline() {
      const activities = plan[String(activeDay)] ?? [];
      timeline.replaceChildren();

      if (activities.length === 0) {
        const empty = document.createElement("div");
        empty.className = "itineraryEmpty";
        empty.innerHTML = "<span>🧭</span><strong>วันนี้ยังว่างอยู่</strong><small>เพิ่มกิจกรรมแรกของวันนี้ด้านล่าง</small>";
        timeline.appendChild(empty);
        return;
      }

      activities.slice().sort((a, b) => a.time.localeCompare(b.time)).forEach((activity) => {
        const article = document.createElement("article");
        article.className = "timelineItem";
        const time = document.createElement("time");
        time.textContent = activity.time;
        const detail = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = activity.title;
        const note = document.createElement("small");
        note.textContent = activity.note;
        detail.append(title, note);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "removeActivity";
        remove.setAttribute("aria-label", `ลบ ${activity.title}`);
        remove.textContent = "×";
        remove.onclick = () => {
          plan[String(activeDay)] = plan[String(activeDay)].filter((item) => item.id !== activity.id);
          savePlan();
          renderTimeline();
        };
        article.append(time, detail, remove);
        timeline.appendChild(article);
      });
    }

    function selectDay(day: number) {
      activeDay = day;
      tabs.querySelectorAll("button").forEach((item, index) => item.classList.toggle("selectedDay", index === day - 1));
      itineraryTitle.textContent = `วันที่ ${day} · เชียงใหม่`;
      renderTimeline();
    }

    tabs.replaceChildren();
    for (let day = 1; day <= totalDays; day += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `วันที่ ${day}`;
      button.onclick = () => selectDay(day);
      tabs.appendChild(button);
    }

    const submitHandler = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const timeInput = addForm.querySelector<HTMLInputElement>('input[type="time"]');
      const titleInput = addForm.querySelector<HTMLInputElement>('input:not([type="time"])');
      const title = titleInput?.value.trim() ?? "";
      if (!title) return;
      plan[String(activeDay)].push({ id: Date.now(), time: timeInput?.value || "09:00", title, note: `เพิ่มในวันที่ ${activeDay}` });
      if (titleInput) titleInput.value = "";
      savePlan();
      renderTimeline();
    };

    addForm.addEventListener("submit", submitHandler, true);
    savePlan();
    selectDay(1);

    return () => {
      observer.disconnect();
      addForm.removeEventListener("submit", submitHandler, true);
    };
  });

  return null;
}
