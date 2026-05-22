import type { HTMLAttributes, ReactNode } from 'react';

interface PanelProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
}

export function Panel({ title, eyebrow, children, className = '', ...props }: PanelProps) {
  return (
    <section className={`panel ${className}`} {...props}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}
