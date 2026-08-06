function doPost(e) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("RSVP") || spreadsheet.insertSheet("RSVP");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["วันที่ตอบ", "ชื่อ", "สถานะ", "หมายเหตุ"]);
    sheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#163d2a").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    e.parameter.name || "",
    e.parameter.status || "",
    e.parameter.note || ""
  ]);

  return ContentService.createTextOutput("success").setMimeType(ContentService.MimeType.TEXT);
}