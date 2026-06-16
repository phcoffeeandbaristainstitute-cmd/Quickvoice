import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import config from "../config.js";

const { symbol, locale } = config.currency;

const fmt = (n) =>
  symbol +
  Number(n).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function generatePDF({ docType, business, client, items, taxRate, notes, logoDataUrl, docNumber, date }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const MARGIN = 48;
  const TEAL = [13, 148, 136];
  const INK = [17, 24, 39];
  const MUTED = [107, 114, 128];
  const BORDER = [229, 231, 235];

  // ── Header bar ──────────────────────────────────────────────
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, W, 6, "F");

  let cursorY = 40;

  // Logo
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", MARGIN, cursorY, 72, 72);
    } catch (_) {}
  }

  // Business info (right-aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(business.name || "Your Business", W - MARGIN, cursorY + 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const bizLines = [business.address, business.email, business.phone].filter(Boolean);
  bizLines.forEach((line, i) => {
    doc.text(line, W - MARGIN, cursorY + 28 + i * 13, { align: "right" });
  });

  cursorY += 96;

  // ── Document type + number ──────────────────────────────────
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(MARGIN, cursorY, W - MARGIN * 2, 52, 4, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...TEAL);
  doc.text(docType.toUpperCase(), MARGIN + 16, cursorY + 33);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`#${docNumber}`, W - MARGIN - 16, cursorY + 22, { align: "right" });
  doc.text(`Date: ${date}`, W - MARGIN - 16, cursorY + 36, { align: "right" });

  cursorY += 72;

  // ── Bill To ─────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("BILL TO", MARGIN, cursorY);
  cursorY += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(client.name || "Client Name", MARGIN, cursorY);
  cursorY += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const clientLines = [client.address, client.email, client.phone].filter(Boolean);
  clientLines.forEach((line) => {
    doc.text(line, MARGIN, cursorY);
    cursorY += 13;
  });

  cursorY += 20;

  // ── Line items table ─────────────────────────────────────────
  const tableBody = items
    .filter((it) => it.description)
    .map((it) => [
      it.description,
      Number(it.qty).toLocaleString(locale),
      fmt(it.rate),
      fmt(Number(it.qty) * Number(it.rate)),
    ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Description", "Qty", "Rate", "Amount"]],
    body: tableBody,
    styles: { font: "helvetica", fontSize: 9, cellPadding: 8, textColor: INK },
    headStyles: {
      fillColor: INK,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 8, bottom: 8, left: 8, right: 8 },
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "right", cellWidth: 50 },
      2: { halign: "right", cellWidth: 70 },
      3: { halign: "right", cellWidth: 80 },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    tableLineColor: BORDER,
    tableLineWidth: 0.5,
  });

  cursorY = doc.lastAutoTable.finalY + 24;

  // ── Totals ───────────────────────────────────────────────────
  const subtotal = items.reduce((s, it) => s + Number(it.qty) * Number(it.rate), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const totalsX = W - MARGIN - 180;
  const totalsW = 180;

  const drawRow = (label, value, bold = false, accent = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(9);
    if (accent) {
      doc.setFillColor(...TEAL);
      doc.roundedRect(totalsX - 8, cursorY - 13, totalsW + 8, 22, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setTextColor(...INK);
    }
    doc.text(label, totalsX + 4, cursorY);
    doc.text(value, W - MARGIN, cursorY, { align: "right" });
    cursorY += 22;
  };

  drawRow("Subtotal", fmt(subtotal));
  drawRow(`Tax (${taxRate}%)`, fmt(tax));
  drawRow("Total", fmt(total), true, true);

  cursorY += 16;

  // ── Notes ────────────────────────────────────────────────────
  if (notes) {
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, cursorY, W - MARGIN, cursorY);
    cursorY += 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("NOTES", MARGIN, cursorY);
    cursorY += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    const noteLines = doc.splitTextToSize(notes, W - MARGIN * 2);
    doc.text(noteLines, MARGIN, cursorY);
  }

  // ── Footer ───────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...TEAL);
  doc.rect(0, pageH - 6, W, 6, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Generated with QuickVoice", W / 2, pageH - 14, { align: "center" });

  doc.save(`${docNumber}.pdf`);
}
