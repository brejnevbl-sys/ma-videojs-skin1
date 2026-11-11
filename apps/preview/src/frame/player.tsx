import { useEffect, useRef } from 'react';
import { Video, VideoPlayer } from '@videojs/react/video';

import { VideoSkin } from '@/video/skin';
import { demoFilm, type DemoFilm } from '../media';
import type { PlaybackProps } from '../shell/params';

/** A stable Video.js container and media node; source changes reset native time, not volume. */
export function Player({ media, film = demoFilm }: { media?: Partial<PlaybackProps>; film?: DemoFilm }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => { video.current?.pause(); video.current?.load(); }, [film.src]);
  return (
    <VideoPlayer poster={film.poster}>
      <VideoSkin aria-label="MA video player">
        <Video ref={video} {...media} src={film.src} playsInline />
      </VideoSkin>
    </VideoPlayer>
  );
}
