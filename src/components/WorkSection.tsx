import { useLang } from '../i18n/LangProvider';
import { PROJECTS } from '../data/content';
import Section from './Section';

export default function WorkSection() {
  const { t, pick } = useLang();

  return (
    <Section
      id="work"
      label={t('section.work.label')}
      title={t('section.work.title')}
      lead={t('section.work.lead')}
    >
      <ul className="cards cards--work">
        {PROJECTS.map((p, i) => (
          <li className="card" key={p.slug} data-reveal data-reveal-delay={(i % 3) * 0.08}>
            <div className="card__top">
              <h3 className="card__title">{p.name}</h3>
              <span className="card__year">{p.year}</span>
            </div>
            <p className="card__summary">{pick(p.summary)}</p>

            <div className="card__meta">
              <span className="card__meta-label">{t('label.role')}</span>
              <span className="card__meta-value">{pick(p.role)}</span>
            </div>

            <ul className="chips">
              {p.stack.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>

            <p className="card__metric">{pick(p.metric)}</p>

            {p.repo ? (
              <a className="card__link" href={p.repo} target="_blank" rel="noreferrer">
                {t('label.viewrepo')}
                <span aria-hidden="true">→</span>
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}
