import React from "react";
import config from "../config.js";
import styles from "./Totals.module.css";

const { symbol, locale } = config.currency;
const fmt = (n) =>
  symbol +
  Number(n || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Totals({ items, taxRate }) {
  const subtotal = items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.rate || 0), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <span>Subtotal</span>
        <span>{fmt(subtotal)}</span>
      </div>
      <div className={styles.row}>
        <span>Tax ({taxRate}%)</span>
        <span>{fmt(tax)}</span>
      </div>
      <div className={`${styles.row} ${styles.total}`}>
        <span>Total</span>
        <span>{fmt(total)}</span>
      </div>
    </div>
  );
}
