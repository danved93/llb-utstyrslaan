import React from 'react';

type BadgeTone = 'neutral' | 'success' | 'info' | 'warning' | 'danger';

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

const toneToClass: Record<BadgeTone, string> = {
  neutral: 'status-badge',
  success: 'status-badge status-active',
  info: 'status-badge status-returned',
  warning: 'status-badge status-pending',
  danger: 'status-badge status-overdue',
};

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return <span className={[toneToClass[tone], className].filter(Boolean).join(' ')}>{children}</span>;
}

export default Badge;

