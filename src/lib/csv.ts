export function toCsv(headers: string[], rows: (string | number)[][]) {
  const escape = (value: string | number) => {
    const str = String(value);
    if (/[",\n;]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers, ...rows].map((row) => row.map(escape).join(";"));
  return "﻿" + lines.join("\n");
}
