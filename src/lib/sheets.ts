// src/lib/sheets.ts

type RowObj = Record<string, string>;

function stripGVizPrefix(body: string) {
  return body
    .replace(/^\s*\/{2,}.*/gm, "")
    .replace(/^[\s\S]*?setResponse\(/, "")
    .replace(/\);\s*$/, "");
}

export async function getRows(): Promise<RowObj[]> {
  // ✅ Use import.meta.env in Astro
  const SHEET_ID  = import.meta.env.SHEET_ID  || import.meta.env.GOOGLE_SHEET_ID;
  const SHEET_TAB = import.meta.env.SHEET_TAB || "neighbourhoods";

  if (!SHEET_ID) {
    throw new Error("Missing SHEET_ID/GOOGLE_SHEET_ID env var");
  }

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}` +
    `/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_TAB)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets fetch failed: ${res.status} ${res.statusText}`);

  const raw = await res.text();
  const json = JSON.parse(stripGVizPrefix(raw));

  const cols: string[] = (json.table.cols || []).map((c: any, i: number) =>
    String(c.label || c.id || `col${i}`).trim().toLowerCase()
  );

  const rows: RowObj[] = (json.table.rows || []).map((r: any) => {
    const obj: RowObj = {};
    (r.c || []).forEach((cell: any, i: number) => {
      const key = cols[i] || `col${i}`;
      obj[key] = cell?.v == null ? "" : String(cell.v); // preserves newlines/HTML
    });
    return obj;
  });

  return rows;
}
