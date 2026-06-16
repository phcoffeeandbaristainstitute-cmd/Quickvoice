import React from "react";
import config from "../config.js";
import styles from "./LineItems.module.css";

const { symbol, locale } = config.currency;
const fmt = (n) =>
  symbol +
  Number(n || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function LineItems({ items, onChange }) {
  const update = (index, field, value) => {
    const next = items.map((it, i) => (i === index ? { ...it, [field]: value } : it));
    onChange(next);
  };

  const add = () =>
    onChange([...items, { id: Date.now(), description: "", qty: 1, rate: "" }]);

  const remove = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.col} style={{ flex: 3 }}>Description</span>
        <span className={styles.col} style={{ flex: 1 }}>Qty</span>
        <span className={styles.col} style={{ flex: 1.5 }}>Rate</span>
        <span className={styles.col} style={{ flex: 1.5, textAlign: "right" }}>Amount</span>
        <span style={{ width: 32 }} />
      </div>

      {items.map((item, i) => {
        const amount = Number(item.qty || 0) * Number(item.rate || 0);
        return (
          <div key={item.id} className={styles.row}>
            <div style={{ flex: 3 }}>
              <input
                value={item.description}
                onChange={(e) => update(i, "description", e.target.value)}
                placeholder="Item description"
              />
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="number"
                min="0"
                value={item.qty}
                onChange={(e) => update(i, "qty", e.target.value)}
              />
            </div>
            <div style={{ flex: 1.5 }}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.rate}
                onChange={(e) => update(i, "rate", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div style={{ flex: 1.5, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <span className={styles.amount}>{fmt(amount)}</span>
            </div>
            <button
              className={styles.remove}
              onClick={() => remove(i)}
              title="Remove item"
              disabled={items.length === 1}
            >
              ×
            </button>
          </div>
        );
      })}

      <button className={styles.addBtn} onClick={add}>
        + Add line item
      </button>
    </div>
  );
}
