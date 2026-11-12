import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FilmGallery } from './film-gallery';

import { sitePath } from '../site-path';
import './style.css';

function App() {
  return (
    <>
      <a className="skip-link" href="#film">Skip to film</a>
      <header className="masthead">
        <a className="wordmark" href={sitePath('')} aria-label="MA home">MA<span lang="ja">間</span></a>
        <span className="eyebrow">The art of interval</span>
        <a href={sitePath('workbench/')}>Skin workbench</a>
      </header>
      <main>
        <section className="introduction" aria-labelledby="title">
          <p className="eyebrow">A study in attention / No. 001</p>
          <h1 id="title">Every moment,<br /><em>in its own time.</em></h1>
          <p className="description">MA is the space between. A quiet frame, a considered pause,
            a little more room for the moving image.</p>
        </section>
        <section id="film" className="film" aria-label="Featured film" tabIndex={-1}>
          <FilmGallery />
        </section>
        <section className="about-skin" aria-labelledby="about-title">
          <h2 id="about-title">About the skin</h2>
          <p>MA takes its name from the Japanese idea of the interval: the space that gives a moment its meaning.
            A brushstroke traces time; open circles and quiet typography leave room for the image.</p>
          <p>Built with Video.js 10.3.0. Skin source licensed under Apache 2.0.
            Selected films are Pexels stock footage, credited to their respective creators.</p>
        </section>
        <aside className="notes" aria-label="Player keyboard shortcuts">
          <p><span lang="ja">間</span> The space between.</p>
          <p>Space · Play / pause <span aria-hidden="true">/</span> ← → · Seek <span aria-hidden="true">/</span> M · Mute <span aria-hidden="true">/</span> F · Fullscreen</p>
        </aside>
      </main>
      <footer><span>MA — The Art of Interval</span><span>Considered space. Moving images.</span></footer>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
