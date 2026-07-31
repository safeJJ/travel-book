"use client";

import { useEffect } from "react";

const STORAGE_KEY = "travel-book-confirmed-dates";

type ConfirmedDates = {
  label: string;
  start: string;
  end: string;
};

function getDayCount(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const difference = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.round(difference / 86_400_000) + 1);
}

export default function ConfirmedDateBridge() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    let confirmed: ConfirmedDates | null = null;

    try {
      confirmed = raw ? JSON.parse(raw) as ConfirmedDates : null;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    const dateTask = Array.from(document.querySelectorAll<HTMLButtonElement>(".taskCard"))
      .find((button) => button.textContent?.includes("เลือกวันเดินทาง"));

    if (dateTask) {
      dateTask.onclick = () => {
        window.location.href = "/date-vote";
      };
    }

    if (!confirmed) return;

    const heroDate = document.querySelector<HTMLElement>(".heroDate");
    if (heroDate) heroDate.textContent = confirmed.label;

    if (dateTask) {
      dateTask.querySelector("strong")!.textContent = "วันที่เดินทางยืนยันแล้ว";
      const detail = dateTask.querySelector("small");
      if (detail) detail.textContent = `${confirmed.label} · แตะเพื่อดูผล`;
    }

    const tabs = document.querySelector<HTMLElement>(".dayTabs");
    const itineraryTitle = Array.from(document.querySelectorAll<HTMLElement>(".simpleHeader h2"))
      .find((element) => element.textContent?.includes("วันที่ 1"));

    if (tabs && itineraryTitle) {
      const totalDays = getDayCount(confirmed.start, confirmed.end);
      tabs.replaceChildren();

      for (let day = 1; day <= totalDays; day += 1) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = `วันที่ ${day}`;
        if (day === 1) button.className = "selectedDay";

        button.addEventListener("click", () => {
          tabs.querySelectorAll("button").forEach((item) => item.classList.remove("selectedDay"));
          button.classList.add("selectedDay");
          itineraryTitle.textContent = `วันที่ ${day} · เชียงใหม่`;
        });

        tabs.appendChild(button);
      }
    }
  });

  return null;
}
