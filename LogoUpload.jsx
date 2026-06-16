import React, { useRef } from "react";
import styles from "./LogoUpload.module.css";

export default function LogoUpload({ logoDataUrl, onChange }) {
  const ref = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={styles.zone}
      onClick={() => ref.current.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onChange(ev.target.result);
        reader.readAsDataURL(file);
      }}
    >
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} className={styles.hidden} />
      {logoDataUrl ? (
        <div className={styles.preview}>
          <img src={logoDataUrl} alt="Logo" />
          <button
            className={styles.remove}
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
          >
            Remove
          </button>
        </div>
      ) : (
        <div className={styles.placeholder}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <span>Upload logo</span>
          <small>PNG, JPG, SVG · Drag & drop or click</small>
        </div>
      )}
    </div>
  );
}
