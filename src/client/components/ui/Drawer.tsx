import React, { useEffect } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
}

export function Drawer({ open, onClose, title, children, width = 420 }: DrawerProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div aria-hidden={!open} style={{ pointerEvents: open ? 'auto' : 'none' }}>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: open ? 'rgba(0,0,0,0.45)' : 'transparent', transition: 'background 150ms', zIndex: 1000 }}
      />
      <aside
        role="dialog"
        aria-modal={open}
        style={{
          position: 'fixed', top: 0, right: 0, height: '100vh', width,
          background: '#fff', boxShadow: 'var(--shadow-2)', transform: `translateX(${open ? 0 : 100}%)`,
          transition: 'transform 200ms ease', zIndex: 1001, display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn btn-secondary" onClick={onClose}>Lukk</button>
        </div>
        <div style={{ padding: '1rem 1.25rem', overflow: 'auto' }}>
          {children}
        </div>
      </aside>
    </div>
  );
}

export default Drawer;

