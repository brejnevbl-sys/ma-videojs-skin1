/** @jsxImportSource react */

import { Controls } from '@videojs/react';
import type { ReactNode } from 'react';

import { CaptionsToggle } from './captions-button';
import { ControlsContent, type ControlsSlots } from './controls';
import { ScreenControls } from './screen-controls';
import { Title } from './title';
import { VideoBufferingIndicator } from './video-feedback';

export function VideoControlsContent({
  center = false,
  live = false,
  menu,
  renderThumbnail,
  seekBackward,
  seekForward,
}: ControlsSlots & { center?: boolean; live?: boolean; menu?: ReactNode } = {}) {
  return (
    <>
      <Controls.Backdrop className={'video-controls-backdrop'} />
      <VideoBufferingIndicator />
      <ControlsContent
        captions={!live && <CaptionsToggle />}
        center={center}
        live={live}
        menu={menu}
        renderThumbnail={renderThumbnail}
        seekBackward={seekBackward}
        seekForward={seekForward}
        top={
          <>
            <div className="ma-player-brand" aria-hidden="true">
              <span className="ma-player-wordmark">MA<span lang="ja">間</span></span>
              <span className="ma-player-tagline">The art of interval</span>
            </div>
            <Title />
            <ScreenControls />
          </>
        }
      />
    </>
  );
}
