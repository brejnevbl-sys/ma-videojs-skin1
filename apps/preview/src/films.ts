import { sitePath } from './site-path';
import type { DemoFilm } from './media';

export interface StockFilm extends DemoFilm {
  id: string;
  author: string;
  expectedSeconds: number;
  source: string;
}

export const films: StockFilm[] = [
  {
    id: 'rainy-day', title: 'Rainy Day', author: 'Roberto Lee Cortes', expectedSeconds: 60,
    src: sitePath('media/pexels/rainy-day.mp4'), poster: sitePath('media/pexels/rainy-day.jpg'),
    description: 'Rainy Day — stock footage by Roberto Lee Cortes, selected from Pexels.',
    source: 'https://www.pexels.com/video/rainy-day-26857124/',
    attribution: { label: 'Roberto Lee Cortes · Pexels', url: sitePath('media/pexels/ATTRIBUTION.md') },
  },
  {
    id: 'autumn-temple', title: 'Serene Japanese Temple in Autumn Forest', author: 'Hideyoshi isai', expectedSeconds: 14,
    src: sitePath('media/pexels/autumn-temple.mp4'), poster: sitePath('media/pexels/autumn-temple.jpg'),
    description: 'Serene Japanese Temple in Autumn Forest — stock footage by Hideyoshi isai, selected from Pexels.',
    source: 'https://www.pexels.com/video/serene-japanese-temple-in-autumn-forest-34948034/',
    attribution: { label: 'Hideyoshi isai · Pexels', url: sitePath('media/pexels/ATTRIBUTION.md') },
  },
];
