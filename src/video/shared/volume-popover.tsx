/** @jsxImportSource react */

import { VolumePopover as VolumePopoverPrimitive, VolumeSlider } from '@videojs/react';
import { useRef } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { MuteButton } from './mute-button';
import { ButtonTooltip } from './tooltip';

export function VolumePopover() {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <VolumePopoverPrimitive.Root
      openOnHover
      delay={200}
      closeDelay={100}
      side="top"
      onOpenChange={(open, details) => {
        // Restore before the native close lifecycle removes the focused slider.
        if (!open && details.reason === 'escape') triggerRef.current?.focus({ preventScroll: true });
      }}
    >
      <ButtonTooltip delay={0} disabled sticky>
        <VolumePopoverPrimitive.Trigger render={<MuteButton ref={triggerRef} />} />
      </ButtonTooltip>
      <VolumePopoverPrimitive.Popup
        render={(props, state) => <div {...props} inert={state.transitionEnding || undefined} />}
        className={cn('media-popup', 'media-popup-safe-area', 'media-volume-popover-popup')}
      >
        <VolumeSlider.Root className={'media-volume-slider'} orientation="vertical" thumbAlignment="edge">
          <VolumeSlider.Track className={'media-volume-slider-track'}>
            <VolumeSlider.Fill className={'media-volume-slider-fill'} />
          </VolumeSlider.Track>
          <VolumeSlider.Thumb className={'media-volume-slider-thumb'} />
        </VolumeSlider.Root>
      </VolumePopoverPrimitive.Popup>
    </VolumePopoverPrimitive.Root>
  );
}
