import * as XLSX from "xlsx";

export async function loadSongs() {
  /* try {
    const custom = await fetch("/my-hits.xlsx");
    if (custom.ok) {
      const buffer = await custom.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(sheet);
    }
  } catch (e) {
    // ha nincs, átmegyünk a fallbackre
  } */

  const response = await fetch("/hits.xlsx");
  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}
