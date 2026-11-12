# Selected Pexels films — stock footage

These films are selected third-party stock footage, not MA's own cinematography.
The owner supplied the four files in Git. Local ffprobe, complete FFmpeg decoding
and unmocked browser tests verified them on 2026-11-12. No further Pexels download
was performed. Both MP4s contain video only: no audio streams.

| Committed local files | Film / creator | Original source | Measured duration |
| --- | --- | --- | --- |
| rainy-day.mp4, rainy-day.jpg | Rainy Day — Roberto Lee Cortes | https://www.pexels.com/video/rainy-day-26857124/ | 60.143417 s, 1280×720 |
| autumn-temple.mp4, autumn-temple.jpg | Serene Japanese Temple in Autumn Forest — Hideyoshi isai | https://www.pexels.com/video/serene-japanese-temple-in-autumn-forest-34948034/ | 14.000 s, 960×540 |

License reference: Pexels License, https://www.pexels.com/license/ .
Review the current terms and verify the selected download on Pexels before publication.
The live Pexels terms and any third-party releases were not independently verified
here; source/creator provenance is recorded from the owner-supplied materials. Do not relabel these films CC0 or Apache-2.0.
The source-code Apache license does not replace the Pexels media license.

Both local MP4s are H.264/yuv420p with fast start (moov precedes mdat), at approximately
24fps. Each matching JPEG is 960×540. They are silent; no music/audio was added. See docs/PEXELS.md in the repository for preparation commands.
