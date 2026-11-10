import { Video, VideoPlayer } from '@videojs/react/video';

import { VideoSkin } from '@/video/skin';
import type { PlaybackProps } from '../shell/params';

/** Local CC0 media from MDN. See public/media/ATTRIBUTION.md. */
export function Player({ media }: { media?: PlaybackProps }) {
  return (
    <VideoPlayer poster="./media/flower-poster.jpg">
      <VideoSkin aria-label="MA video player">
        <Video {...media} src="./media/flower.mp4" playsInline />
      </VideoSkin>
    </VideoPlayer>
  );
}
