import React, { useState } from "react";
import config from "./config.js";
import { generatePDF } from "./utils/generatePDF.js";
import Section from "./components/Section.jsx";
import { Field, FieldRow } from "./components/Field.jsx";
import LineItems from "./components/LineItems.jsx";
import Totals from "./components/Totals.jsx";
import LogoUpload from "./components/LogoUpload.jsx";
import styles from "./App.module.css";

const { defaultTaxRate, invoicePrefix, receiptPrefix } = config;

const today = () => new Date().toISOString().slice(0, 10);
const genNumber = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;

export default function App() {
  const [docType, setDocType] = useState("Invoice");
  const [docNumber] = useState({
    Invoice: genNumber(invoicePrefix),
    Receipt: genNumber(receiptPrefix),
  });
  const [date, setDate] = useState(today());
  const [logoDataUrl, setLogoDataUrl] = useState(null);

  const [business, setBusiness] = useState({
    name: "", address: "", email: "", phone: "",
  });

  const [client, setClient] = useState({
    name: "", address: "", email: "", phone: "",
  });

  const [items, setItems] = useState([
    { id: 1, description: "", qty: 1, rate: "" },
  ]);

  const [taxRate, setTaxRate] = useState(defaultTaxRate);
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleBusiness = (field) => (e) =>
    setBusiness((b) => ({ ...b, [field]: e.target.value }));

  const handleClient = (field) => (e) =>
    setClient((c) => ({ ...c, [field]: e.target.value }));

  const handleDownload = async () => {
    setGenerating(true);
    try {
      generatePDF({
        docType,
        business,
        client,
        items,
        taxRate: Number(taxRate),
        notes,
        logoDataUrl,
        docNumber: docNumber[docType],
        date,
      });
    } finally {
      setTimeout(() => setGenerating(false), 800);
    }
  };

  return (
    <div className={styles.app}>
      {/* ── Top bar ─────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>Q</span>
            <span className={styles.logoText}>QuickVoice</span>
          </div>

          <div className={styles.toggle}>
            {["Invoice", "Receipt"].map((type) => (
              <button
                key={type}
                className={`${styles.toggleBtn} ${docType === type ? styles.active : ""}`}
                onClick={() => setDocType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            className={styles.downloadBtn}
            onClick={handleDownload}
            disabled={generating}
          >
            {generating ? "Generating…" : "↓ Download PDF"}
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* ── Document meta ───────────────── */}
        <Section title="Document Details">
          <FieldRow>
            <Field label="Document Number">
              <input value={docNumber[docType]} readOnly className={styles.readOnly} />
            </Field>
            <Field label="Date">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
          </FieldRow>
        </Section>

        {/* ── Business info ───────────────── */}
        <Section title="Your Business">
          <LogoUpload logoDataUrl={logoDataUrl} onChange={setLogoDataUrl} />
          <div style={{ marginTop: "1rem" }}>
            <Field label="Business Name">
              <input value={business.name} onChange={handleBusiness("name")} placeholder="Acme Corp." />
            </Field>
            <Field label="Address">
              <input value={business.address} onChange={handleBusiness("address")} placeholder="123 Main St, City" />
            </Field>
            <FieldRow>
              <Field label="Email">
                <input type="email" value={business.email} onChange={handleBusiness("email")} placeholder="hello@acme.com" />
              </Field>
              <Field label="Phone">
                <input value={business.phone} onChange={handleBusiness("phone")} placeholder="+63 9XX XXX XXXX" />
              </Field>
            </FieldRow>
          </div>
        </Section>

        {/* ── Client info ─────────────────── */}
        <Section title="Bill To">
          <Field label="Client Name">
            <input value={client.name} onChange={handleClient("name")} placeholder="Client or company name" />
          </Field>
          <Field label="Address">
            <input value={client.address} onChange={handleClient("address")} placeholder="456 Client Ave, City" />
          </Field>
          <FieldRow>
            <Field label="Email">
              <input type="email" value={client.email} onChange={handleClient("email")} placeholder="client@email.com" />
            </Field>
            <Field label="Phone">
              <input value={client.phone} onChange={handleClient("phone")} placeholder="+63 9XX XXX XXXX" />
            </Field>
          </FieldRow>
        </Section>

        {/* ── Line items ──────────────────── */}
        <Section title="Line Items">
          <LineItems items={items} onChange={setItems} />
        </Section>

        {/* ── Tax + Totals ────────────────── */}
        <Section title="Summary">
          <Field label={`Tax Rate (%)`}>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              style={{ maxWidth: 120 }}
            />
          </Field>
          <Totals items={items} taxRate={Number(taxRate)} />
        </Section>

        {/* ── Notes ───────────────────────── */}
        <Section title="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, bank details, thank-you message…"
          />
        </Section>

        {/* ── Download (mobile) ───────────── */}
        <button
          className={`${styles.downloadBtn} ${styles.mobileDownload}`}
          onClick={handleDownload}
          disabled={generating}
        >
          {generating ? "Generating…" : "↓ Download PDF"}
        </button>
      </main>

      <footer className={styles.footer}>
        Made with QuickVoice · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
