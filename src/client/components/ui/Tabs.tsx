import React from 'react';

export interface TabItem<T = string> {
  key: T;
  label: string;
}

interface TabsProps<T = string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function Tabs<T extends string>({ tabs, value, onChange }: TabsProps<T>) {
  return (
    <div className="tabs" role="tablist" aria-label="Filter etter status">
      {tabs.map((t) => (
        <button
          key={String(t.key)}
          role="tab"
          aria-selected={t.key === value}
          className={`tab ${t.key === value ? 'tab-active' : ''}`}
          onClick={() => onChange(t.key)}
          type="button"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default Tabs;

