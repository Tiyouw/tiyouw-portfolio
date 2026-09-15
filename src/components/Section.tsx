import type { ReactNode } from 'react';

interface Props {
  id: string;
  label: string;
  title: string;
  lead?: string;
  children: ReactNode;
}

export default function Section({ id, label, title, lead, children }: Props) {
  return (
    <section className="section" id={id}>
      <div className="section__head">
        <p className="section__label" data-reveal>
          {label}
        </p>
        <h2 className="section__title" data-wipe>
          {title}
        </h2>
        {lead ? (
          <p className="section__lead" data-reveal data-reveal-delay="0.1">
            {lead}
          </p>
        ) : null}
      </div>
      <div className="section__body">{children}</div>
    </section>
  );
}
