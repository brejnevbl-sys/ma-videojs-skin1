import { sitePath } from './site-path';

export interface DemoFilm {
  src: string;
  poster: string;
  title: string;
  description: string;
  attribution: { label: string; url: string };
}

/** Edit this record when the owner's 60-second film is ready; controls read native media state. */
export const demoFilm: DemoFilm = {
  src: sitePath('media/flower.mp4'),
  poster: sitePath('media/flower-poster.jpg'),
  title: 'In bloom',
  description: 'A brief observation of flowers in the breeze.',
  attribution: {
    label: 'Film: MDN · CC0',
    url: sitePath('media/ATTRIBUTION.md'),
  },
};
