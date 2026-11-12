import { useEffect, useState, useRef } from 'react';
import { Player } from '../frame/player';
import { films } from '../films';

export function FilmGallery() {
  const mediaRef = useRef<HTMLVideoElement>(null);
  const [selected, setSelected] = useState(films[0].id);
  const [assets, setAssets] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);
  const film = films.find(item => item.id === selected)!;

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all(films.map(async item => {
      const responses = await Promise.all([item.src, item.poster].map(url =>
        fetch(url, { method: 'HEAD', signal: controller.signal }).catch(() => null)));
      return [item.id, responses.every((r, i) => r?.ok &&
        (r.headers.get('content-type') ?? '').startsWith(i === 0 ? 'video/mp4' : 'image/'))] as const;
    })).then(entries => {
      if (!controller.signal.aborted) { setAssets(Object.fromEntries(entries)); setChecked(true); }
    });
    return () => controller.abort();
  }, []);

  return (
    <>
      <fieldset className="film-selector">
        <legend>Choose a film</legend>
        {films.map((item, index) => (
          <label key={item.id}>
            <input type="radio" name="film" value={item.id} checked={item.id === selected}
              onChange={() => {
                // Pause the old source before React changes src, so Video.js receives its pause event.
                mediaRef.current?.pause();
                setSelected(item.id);
              }} />
            <span className="film-number" aria-hidden="true">0{index + 1}</span>
            <span>{item.title}<small>{item.author}</small></span>
          </label>
        ))}
      </fieldset>
      <div className="film-heading"><span className="eyebrow">{film.title}</span><span>Take a moment.</span></div>
      {assets[film.id] ? (
        <div className="player-frame"><Player mediaRef={mediaRef} film={film} media={{ autoPlay: false, loop: false, preload: 'metadata' }} /></div>
      ) : (
        <div className="film-unavailable" role="status">
          <p>{checked ? 'Film files are not installed yet.' : 'Checking film files…'}</p>
          <p>{film.title} · {film.author}</p>
          <p>Selected Pexels stock footage. No replacement video is being shown.</p>
          <a href={film.source}>View the original on Pexels</a>
        </div>
      )}
      <div className="film-caption" aria-live="polite">
        <p>{film.description}{film.silent && <span> Silent film · no audio.</span>}</p><a href={film.attribution.url}>{film.attribution.label}</a>
      </div>
    </>
  );
}
