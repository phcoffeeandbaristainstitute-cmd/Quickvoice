import React from "react";
import styles from "./Field.module.css";

export function Field({ label, children, half }) {
  return (
    <div className={`${styles.field} ${half ? styles.half : ""}`}>
      {label && <label>{label}</label>}
      {children}
    </div>
  );
}

export function FieldRow({ children }) {
  return <div className={styles.row}>{children}</div>;
}
