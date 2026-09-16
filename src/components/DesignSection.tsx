import { useLang } from '../i18n/LangProvider';
import { DESIGNS } from '../data/content';
import Section from './Section';
import PaletteCanvas from './PaletteCanvas';

export default function DesignSection() {
  const { t, pick } = useLang();

  return (
    <Section
      id="design"
      label={t('section.design.label')}
      title={t('section.design.title')}
      lead={t('section.design.lead')}
    >
      <ul className="cards cards--design">
        {DESIGNS.map((d, i) => (
          <li className="design-card" key={d.slug} data-reveal data-reveal-delay={(i % 3) * 0.08}>
            <div className="design-card__visual">
              <PaletteCanvas seed={d.slug} palette={d.palette} />
            </div>
            <div className="design-card__body">
              <h3 className="design-card__title">{d.title}</h3>
              <p className="design-card__discipline">{pick(d.discipline)}</p>
              <p className="design-card__note">{pick(d.note)}</p>
              <ul className="chips">
                {d.tools.map((tool) => (
                  <li className="chip" key={tool}>
                    {tool}
                  </li>
                ))}
              </ul>
              <div className="swatches" aria-label={t('label.palette')}>
                {d.palette.map((c) => (
                  <span key={c} className="swatch" style={{ background: c }} title={c} />
                ))}
              </div>
              {d.live ? (
                <a className="card__link" href={d.live} target="_blank" rel="noreferrer">
                  {t('label.visit')}
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
