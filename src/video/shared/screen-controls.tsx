/** @jsxImportSource react */

import {
  PiPButton as PiPButtonPrimitive,
  FullscreenButton as FullscreenButtonPrimitive,
} from '@videojs/react';
import {
  PipEnterIcon as PipEnterIconPrimitive,
  PipExitIcon as PipExitIconPrimitive,
  FullscreenEnterIcon as FullscreenEnterIconPrimitive,
  FullscreenExitIcon as FullscreenExitIconPrimitive,
} from '@videojs/react/icons/scaffold';

import { cn } from '@/lib/resolve-class-name';

import { AirPlayButton } from './airplay-button';
import { Button } from './button';
import { ButtonTooltip } from './tooltip';

function PiPButton() {
  return (
    <ButtonTooltip popupClassName={'media-tooltip-screen-popup'}>
      <PiPButtonPrimitive render={<Button />} className={'media-pip-button'}>
        <PipEnterIconPrimitive className={cn('media-button-icon', 'media-pip-button-enter-icon')} />
        <PipExitIconPrimitive className={cn('media-button-icon', 'media-pip-button-exit-icon')} />
      </PiPButtonPrimitive>
    </ButtonTooltip>
  );
}

function FullscreenButton() {
  return (
    <ButtonTooltip popupClassName={'media-tooltip-screen-popup'}>
      <FullscreenButtonPrimitive render={<Button />} className={'media-fullscreen-button'}>
        <FullscreenEnterIconPrimitive className={cn('media-button-icon', 'media-fullscreen-button-enter-icon')} />
        <FullscreenExitIconPrimitive className={cn('media-button-icon', 'media-fullscreen-button-exit-icon')} />
      </FullscreenButtonPrimitive>
    </ButtonTooltip>
  );
}

export function ScreenControls() {
  return (
    <>
      <AirPlayButton popupClassName={'media-tooltip-screen-popup'} />
      <PiPButton />
      <FullscreenButton />
    </>
  );
}
