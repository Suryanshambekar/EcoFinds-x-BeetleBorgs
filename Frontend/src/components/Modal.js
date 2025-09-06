import React from "react";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
    }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--card)", borderRadius: "var(--radius)", overflow: "hidden", maxWidth: 720, width: "95%" }}>
        {children}
      </div>
    </div>
  );
}
