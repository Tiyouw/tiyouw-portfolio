import { useLang } from '../i18n/LangProvider';
import { PROFILE } from '../data/content';

export default function ContactSection() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <section className="contact" id="contact">
      <p className="section__label" data-reveal>
        {t('section.contact.label')}
      </p>
      <h2 className="contact__title" data-wipe>
        {t('section.contact.title')}
      </h2>
      <p className="contact__lead" data-reveal data-reveal-delay="0.08">
        {t('section.contact.lead')}
      </p>

      <div className="contact__links" data-reveal data-reveal-delay="0.16">
        <a className="btn btn--primary" href={`mailto:${PROFILE.email}`}>
          {PROFILE.email}
        </a>
        <a className="btn btn--ghost" href={PROFILE.github} target="_blank" rel="noreferrer">
          github.com/{PROFILE.handle}
        </a>
      </div>

      <footer className="footer">
        <span>
          © {year} {PROFILE.name}. {t('footer.rights')}
        </span>
        <span>{t('footer.built')}</span>
      </footer>
    </section>
  );
}
