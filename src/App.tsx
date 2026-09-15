import { useLang } from './i18n/LangProvider';
import { useMotionPref } from './hooks/useMotionPref';
import { useReveals, useSmoothScroll } from './hooks/useScrollAnim';
import Nav from './components/Nav';
import Hero from './components/Hero';
import WorkSection from './components/WorkSection';
import DesignSection from './components/DesignSection';
import VideoSection from './components/VideoSection';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';

export default function App() {
  const reduced = useMotionPref();
  const { lang } = useLang();
  useSmoothScroll(reduced);
  useReveals(reduced);

  return (
    <div className="app" key={lang}>
      <Nav />
      <main>
        <Hero />
        <WorkSection />
        <DesignSection />
        <VideoSection />
        <AboutSection />
        <ContactSection />
      </main>
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
