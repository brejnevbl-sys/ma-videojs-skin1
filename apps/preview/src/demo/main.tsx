import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Player } from '../frame/player';
import './style.css';

function App() {
  return (
    <>
      <a className="skip-link" href="#film">Skip to film</a>
      <header className="masthead">
        <a className="wordmark" href="./ma.html" aria-label="MA home">MA<span lang="ja">間</span></a>
        <span className="eyebrow">The art of interval</span>
        <a href="./">Skin workbench <span aria-hidden="true">↗</span></a>
      </header>
      <main>
        <section className="introduction" aria-labelledby="title">
          <p className="eyebrow">A study in attention · 01</p>
          <h1 id="title">Room for the<br /><em>moment.</em></h1>
          <p className="description">Between one moment and the next, there is space to see.
            A quiet frame for moving images.</p>
        </section>
        <section id="film" className="film" aria-label="Featured film" tabIndex={-1}>
          <div className="film-heading"><span className="eyebrow">01 / In bloom</span><span>Take a moment.</span></div>
          <div className="player-frame"><Player media={{ autoPlay: false, muted: false, loop: false, preload: 'metadata' }} /></div>
          <div className="film-caption"><p>A brief observation of flowers in the breeze.</p><a href="./media/ATTRIBUTION.md">Film: MDN · CC0</a></div>
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
