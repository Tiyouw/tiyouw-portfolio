import { useEffect, useState } from 'react';
import { useLang } from '../i18n/LangProvider';
import { useMotionPref, setMotionPref } from '../hooks/useMotionPref';
import { PROFILE } from '../data/content';

const LINKS: { id: string; key: 'nav.work' | 'nav.design' | 'nav.video' | 'nav.about' | 'nav.contact' }[] = [
  { id: 'work', key: 'nav.work' },
  { id: 'design', key: 'nav.design' },
  { id: 'video', key: 'nav.video' },
  { id: 'about', key: 'nav.about' },
  { id: 'contact', key: 'nav.contact' },
];

export default function Nav() {
  const { t, lang, toggle } = useLang();
  const reduced = useMotionPref();
  const [active, setActive] = useState('work');
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <header className={`nav ${solid ? 'nav--solid' : ''}`}>
      <a className="nav__brand" href="#top">
        <span className="nav__mark" aria-hidden="true" />
        <span className="nav__name">{PROFILE.handle}</span>
      </a>

      <nav className="nav__links" aria-label="Sections">
        {LINKS.map((l) => (
          <a key={l.id} href={`#${l.id}`} className={active === l.id ? 'is-active' : ''}>
            {t(l.key)}
          </a>
        ))}
      </nav>

      <div className="nav__actions">
        <button
          type="button"
          className="pill pill--ghost"
          onClick={() => setMotionPref(!reduced)}
          title={reduced ? t('motion.enable') : t('motion.reduce')}
        >
          {reduced ? t('motion.enable') : t('motion.reduce')}
        </button>
        <button type="button" className="pill pill--lang" onClick={toggle} aria-label={t('lang.aria')}>
          <span className={lang === 'en' ? 'is-on' : ''}>EN</span>
          <span className="pill__sep" aria-hidden="true" />
          <span className={lang === 'id' ? 'is-on' : ''}>ID</span>
        </button>
      </div>
      <div className="nav__progress" data-progress-bar aria-hidden="true" />
    </header>
  );
}
