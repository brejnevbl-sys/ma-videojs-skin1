import { useEffect, useRef, type RefObject } from 'react';
import { Video, VideoPlayer } from '@videojs/react/video';

import { VideoSkin } from '@/video/skin';
import { demoFilm, type DemoFilm } from '../media';
import type { PlaybackProps } from '../shell/params';

/** A stable Video.js container and media node; source changes reset native time, not volume. */
export function Player({ media, film = demoFilm, mediaRef }: { media?: Partial<PlaybackProps>; film?: DemoFilm; mediaRef?: RefObject<HTMLVideoElement | null> }) {
  const internalVideo = useRef<HTMLVideoElement>(null);
  const video = mediaRef ?? internalVideo;
  useEffect(() => { video.current?.pause(); video.current?.load(); }, [film.src]);
  return (
    <VideoPlayer poster={film.poster}>
      <VideoSkin aria-label="MA video player">
        <Video ref={video} {...media} src={film.src} playsInline />
      </VideoSkin>
    </VideoPlayer>
  );
}
