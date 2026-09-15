import { useLang } from '../i18n/LangProvider';
import { PROFILE, SKILLS, TIMELINE } from '../data/content';
import Section from './Section';

export default function AboutSection() {
  const { t, pick } = useLang();

  return (
    <Section id="about" label={t('section.about.label')} title={t('section.about.title')}>
      <div className="about">
        <div className="about__lead" data-reveal>
          <p className="about__statement">{pick(PROFILE.statement)}</p>
          <p className="about__body">{pick(PROFILE.intro)}</p>
          <p className="about__where">{pick(PROFILE.location)}</p>
        </div>

        <div className="about__skills">
          <h3 className="about__subtitle" data-reveal>
            {t('section.skills.title')}
          </h3>
          <ul className="skill-groups">
            {SKILLS.map((group, i) => (
              <li key={group.group.en} data-reveal data-reveal-delay={i * 0.05}>
                <span className="skill-groups__name">{pick(group.group)}</span>
                <ul className="chips">
                  {group.items.map((item) => (
                    <li className="chip" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <div className="about__timeline">
          <h3 className="about__subtitle" data-reveal>
            {t('section.timeline.title')}
          </h3>
          <ol className="timeline">
            {TIMELINE.map((item, i) => (
              <li key={item.year} data-reveal data-reveal-delay={i * 0.06}>
                <span className="timeline__year">{item.year}</span>
                <div>
                  <h4 className="timeline__title">{pick(item.title)}</h4>
                  <p className="timeline__body">{pick(item.body)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
