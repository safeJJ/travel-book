const form=document.getElementById("rsvpForm");
const successMessage=document.getElementById("successMessage");
const submitBtn=document.getElementById("submitBtn");
const submitAnother=document.getElementById("submitAnother");

// นำ URL จาก Google Apps Script Web App มาใส่แทนข้อความด้านล่าง
const GOOGLE_SCRIPT_URL="PUT_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
form.action=GOOGLE_SCRIPT_URL;

form.addEventListener("submit",(event)=>{
  if(GOOGLE_SCRIPT_URL.includes("PUT_YOUR")){
    event.preventDefault();
    alert("ยังไม่ได้เชื่อม Google Sheets: ให้นำ URL จาก Apps Script มาใส่ในไฟล์ rsvp/script.js");
    return;
  }
  submitBtn.disabled=true;
  submitBtn.querySelector("span:first-child").textContent="กำลังส่ง...";
  setTimeout(()=>{
    form.hidden=true;
    successMessage.hidden=false;
    submitBtn.disabled=false;
    submitBtn.querySelector("span:first-child").textContent="ส่งคำตอบ";
  },1000);
});

submitAnother.addEventListener("click",()=>{
  form.reset();
  form.hidden=false;
  successMessage.hidden=true;
  window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
});