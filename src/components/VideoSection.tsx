import { useState } from 'react';
import { useLang } from '../i18n/LangProvider';
import { VIDEOS } from '../data/content';
import Section from './Section';
import EditStrip from './EditStrip';

export default function VideoSection() {
  const { t, pick } = useLang();
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <Section
      id="video"
      label={t('section.video.label')}
      title={t('section.video.title')}
      lead={t('section.video.lead')}
    >
      <ul className="cards cards--video">
        {VIDEOS.map((v, i) => {
          const isPlaying = playing === v.slug;
          return (
            <li className="video-card" key={v.slug} data-reveal data-reveal-delay={(i % 2) * 0.08}>
              <div className="video-card__head">
                <div>
                  <h3 className="video-card__title">{v.title}</h3>
                  <p className="video-card__kind">{pick(v.kind)}</p>
                </div>
                <button
                  type="button"
                  className={`play ${isPlaying ? 'is-playing' : ''}`}
                  onClick={() => setPlaying(isPlaying ? null : v.slug)}
                  aria-label={isPlaying ? t('video.pause') : t('video.play')}
                >
                  <span aria-hidden="true">{isPlaying ? '❙❙' : '▶'}</span>
                </button>
              </div>

              <EditStrip seed={v.slug} cuts={v.cuts} duration={v.duration} playing={isPlaying} />

              <p className="video-card__note">{pick(v.note)}</p>

              <div className="video-card__meta">
                <span>
                  <em>{t('label.duration')}</em> {v.duration}
                </span>
                <span>
                  <em>{t('label.cuts')}</em> {v.cuts}
                </span>
              </div>

              <ul className="chips">
                {v.tools.map((tool) => (
                  <li className="chip" key={tool}>
                    {tool}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      <p className="section__footnote" data-reveal>
        {t('video.note')}
      </p>
    </Section>
  );
}
