import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LangProvider } from './i18n/LangProvider';
import App from './App';
import { applyContent } from './data/content';
import './styles/global.css';

async function boot() {
  try {
    const res = await fetch('/content.json', { cache: 'no-store' });
    if (res.ok) applyContent(await res.json());
  } catch {
    /* bundled fallback stays */
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <LangProvider>
        <App />
      </LangProvider>
    </StrictMode>,
  );
}

void boot();
