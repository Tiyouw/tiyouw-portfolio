import { Suspense, lazy } from 'react';
import { useLang } from '../i18n/LangProvider';
import { PROFILE, PROJECTS, DESIGNS, VIDEOS } from '../data/content';

const HeroScene = lazy(() => import('../three/HeroScene'));

export default function Hero() {
  const { t, pick } = useLang();

  return (
    <section className="hero" id="top">
      <div className="hero__scene" aria-hidden="true">
        <Suspense fallback={<div className="hero__scene-fallback" />}>
          <HeroScene />
        </Suspense>
      </div>

      <div className="hero__inner">
        <p className="hero__eyebrow" data-reveal>
          {t('hero.eyebrow')}
        </p>
        <h1 className="hero__title" data-reveal data-reveal-delay="0.08">
          {PROFILE.name}
        </h1>
        <p className="hero__role" data-reveal data-reveal-delay="0.16">
          {pick(PROFILE.role)}
        </p>
        <p className="hero__intro" data-reveal data-reveal-delay="0.24">
          {pick(PROFILE.intro)}
        </p>

        <div className="hero__cta" data-reveal data-reveal-delay="0.32">
          <a className="btn btn--primary" href="#work">
            {t('hero.cta.work')}
          </a>
          <a className="btn btn--ghost" href="#contact">
            {t('hero.cta.contact')}
          </a>
        </div>

        <dl className="hero__stats" data-reveal data-reveal-delay="0.4">
          <div>
            <dt>{t('label.projects')}</dt>
            <dd>{PROJECTS.length}+</dd>
          </div>
          <div>
            <dt>{t('label.disciplines')}</dt>
            <dd>3</dd>
          </div>
          <div>
            <dt>{t('nav.design')}</dt>
            <dd>{DESIGNS.length}</dd>
          </div>
          <div>
            <dt>{t('nav.video')}</dt>
            <dd>{VIDEOS.length}</dd>
          </div>
        </dl>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>{t('hero.scroll')}</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  );
}
