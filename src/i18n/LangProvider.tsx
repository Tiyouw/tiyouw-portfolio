import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang, Localized } from '../data/content';

const DICT = {
  'nav.work': { en: 'Code', id: 'Kode' },
  'nav.design': { en: 'Design', id: 'Desain' },
  'nav.video': { en: 'Video', id: 'Video' },
  'nav.about': { en: 'About', id: 'Tentang' },
  'nav.contact': { en: 'Contact', id: 'Kontak' },

  'hero.eyebrow': { en: 'Backend · Design · Motion', id: 'Backend · Desain · Motion' },
  'hero.scroll': { en: 'Scroll', id: 'Gulir' },
  'hero.cta.work': { en: 'See the work', id: 'Lihat karya' },
  'hero.cta.contact': { en: 'Start a conversation', id: 'Mulai percakapan' },

  'section.work.label': { en: '01 — Engineering', id: '01 — Rekayasa' },
  'section.work.title': { en: 'Systems that hold up', id: 'Sistem yang bertahan' },
  'section.work.lead': {
    en: 'Selected repositories. Civic data, education platforms, and automation that runs without supervision.',
    id: 'Repositori terpilih. Data publik, platform pendidikan, dan otomasi yang jalan tanpa diawasi.',
  },
  'section.design.label': { en: '02 — Design', id: '02 — Desain' },
  'section.design.title': { en: 'Interfaces and graphic systems', id: 'Antarmuka dan sistem grafis' },
  'section.design.lead': {
    en: 'Colour, type, and layout decisions made in service of the thing being used — not the screenshot.',
    id: 'Keputusan warna, tipografi, dan layout demi hal yang dipakai — bukan demi tangkapan layar.',
  },
  'section.video.label': { en: '03 — Video', id: '03 — Video' },
  'section.video.title': { en: 'Edits with a pulse', id: 'Editan yang berdenyut' },
  'section.video.lead': {
    en: 'Recaps, demos, and short-form cutdowns. Pacing first, effects only when they carry meaning.',
    id: 'Rekap, demo, dan cutdown short-form. Ritme dulu, efek hanya bila membawa makna.',
  },
  'section.about.label': { en: '04 — About', id: '04 — Tentang' },
  'section.about.title': { en: 'One person, three toolsets', id: 'Satu orang, tiga perangkat' },
  'section.skills.title': { en: 'Toolset', id: 'Perangkat' },
  'section.timeline.title': { en: 'Trajectory', id: 'Lintasan' },
  'section.contact.label': { en: '05 — Contact', id: '05 — Kontak' },
  'section.contact.title': { en: 'Available for work', id: 'Terbuka untuk kerja sama' },
  'section.contact.lead': {
    en: 'Backend builds, interface design, or an edit that needs rhythm. Email is fastest.',
    id: 'Pembangunan backend, desain antarmuka, atau editan yang butuh ritme. Email paling cepat.',
  },

  'label.role': { en: 'Role', id: 'Peran' },
  'label.stack': { en: 'Stack', id: 'Stack' },
  'label.tools': { en: 'Tools', id: 'Alat' },
  'label.discipline': { en: 'Discipline', id: 'Disiplin' },
  'label.palette': { en: 'Palette', id: 'Palet' },
  'label.duration': { en: 'Duration', id: 'Durasi' },
  'label.cuts': { en: 'Cuts', id: 'Potongan' },
  'label.repo': { en: 'Repository', id: 'Repositori' },
  'label.viewrepo': { en: 'View source', id: 'Lihat kode' },
  'label.visit': { en: 'Visit live', id: 'Kunjungi situs' },
  'label.projects': { en: 'Repositories', id: 'Repositori' },
  'label.years': { en: 'Years shipping', id: 'Tahun berkarya' },
  'label.disciplines': { en: 'Disciplines', id: 'Disiplin' },

  'video.play': { en: 'Play preview', id: 'Mainkan pratinjau' },
  'video.pause': { en: 'Pause', id: 'Jeda' },
  'video.note': {
    en: 'Previews are generated in-browser from the edit metadata: cut count, duration, and pacing curve.',
    id: 'Pratinjau dibuat langsung di browser dari metadata editan: jumlah potongan, durasi, dan kurva ritme.',
  },

  'lang.toggle': { en: 'Bahasa Indonesia', id: 'English' },
  'lang.aria': { en: 'Switch language', id: 'Ganti bahasa' },
  'motion.reduce': { en: 'Reduce motion', id: 'Kurangi animasi' },
  'motion.enable': { en: 'Enable motion', id: 'Aktifkan animasi' },

  'footer.built': {
    en: 'Built with React, three.js, and GSAP. No template.',
    id: 'Dibangun dengan React, three.js, dan GSAP. Tanpa template.',
  },
  'footer.rights': { en: 'All rights reserved.', id: 'Seluruh hak dilindungi.' },
} as const;

export type DictKey = keyof typeof DICT;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: DictKey) => string;
  pick: (value: Localized) => string;
}

const Ctx = createContext<LangCtx | null>(null);
const STORAGE_KEY = 'tiyouw.lang';

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'id' || saved === 'en' ? saved : 'en';
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LangCtx>(
    () => ({
      lang,
      setLang,
      toggle: () => setLang((p) => (p === 'en' ? 'id' : 'en')),
      t: (key) => DICT[key][lang],
      pick: (value) => value[lang],
    }),
    [lang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
