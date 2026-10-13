export function exportCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
): void {
  const escape = (value: string | number) => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const header = headers.map(escape).join(",") + "\n";
  const body = rows.map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([header + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
