import { Video, VideoPlayer } from '@videojs/react/video';

import { VideoSkin } from '@/video/skin';
import { demoFilm, type DemoFilm } from '../media';
import type { PlaybackProps } from '../shell/params';

/** Local CC0 media from MDN. See public/media/ATTRIBUTION.md. */
export function Player({ media, film = demoFilm }: { media?: PlaybackProps; film?: DemoFilm }) {
  return (
    <VideoPlayer poster={film.poster}>
      <VideoSkin aria-label="MA video player">
        <Video {...media} src={film.src} playsInline />
      </VideoSkin>
    </VideoPlayer>
  );
}
