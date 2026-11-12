# Два фильма Pexels: подготовка локальных файлов

## Статус

Четыре файла добавлены в ветку `feat/ma-pexels-films` (коммит `cfb0f44`):
`rainy-day.mp4` (H.264, 1280×720, 60.143 с), `rainy-day.jpg`,
`autumn-temple.mp4` (H.264, 960×540, 14.0 с) и `autumn-temple.jpg`.
Файлы получены из предоставленных владельцем Pexels-роликов, проверены по Git SHA-1.
Первоначально облачный прокси Codex блокировал Pexels (403); препятствие обойдено
через рабочее хранилище и подключённый GitHub. Видео **ещё не проверены на публичном
Vercel-сайте**. MDN sample остаётся только в техническом workbench/preview.

## Источники и инструкция для повторной загрузки

Откройте страницы в обычном браузере и используйте официальный Download:

1. **Rainy Day**, **Roberto Lee Cortes**, ID **26857124**
   https://www.pexels.com/video/rainy-day-26857124/
   Выбран основным. Заданная пользователем длительность: 60 с, 16:9.
2. **Serene Japanese Temple in Autumn Forest**, **Hideyoshi isai**, ID **34948034**
   https://www.pexels.com/video/serene-japanese-temple-in-autumn-forest-34948034/
   Дополнительный. Заданная пользователем длительность: 14 с, 16:9.

При повторной загрузке проверьте название, автора и фактическую длительность. Выберите HD
1280×720 MP4, если доступен, либо исходный MP4 и конвертируйте его ниже. Если страница
или её параметры отличаются, остановитесь: не берите другой ролик с похожим названием.
Не копируйте временные download URL в код. Сохраните оригиналы вне Git, например:
`/tmp/ma-pexels-originals/rainy-day-source.mp4` и `autumn-temple-source.mp4`.

## Оптимизация (FFmpeg)

Из корня репозитория, после установки FFmpeg/ffprobe:

```sh
mkdir -p apps/preview/public/media/pexels
ffmpeg -i /tmp/ma-pexels-originals/rainy-day-source.mp4 \
  -map 0:v:0 -map '0:a:0?' \
  -vf 'scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2,fps=30' \
  -c:v libx264 -preset medium -crf 24 -maxrate 2500k -bufsize 5000k \
  -pix_fmt yuv420p -c:a aac -b:a 96k -ac 2 -movflags +faststart \
  apps/preview/public/media/pexels/rainy-day.mp4
ffmpeg -i /tmp/ma-pexels-originals/autumn-temple-source.mp4 \
  -map 0:v:0 -map '0:a:0?' \
  -vf 'scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2,fps=30' \
  -c:v libx264 -preset medium -crf 24 -maxrate 2500k -bufsize 5000k \
  -pix_fmt yuv420p -c:a aac -b:a 96k -ac 2 -movflags +faststart \
  apps/preview/public/media/pexels/autumn-temple.mp4
ffmpeg -ss 2 -i apps/preview/public/media/pexels/rainy-day.mp4 \
  -frames:v 1 -vf 'scale=960:-2' -q:v 3 apps/preview/public/media/pexels/rainy-day.jpg
ffmpeg -ss 1 -i apps/preview/public/media/pexels/autumn-temple.mp4 \
  -frames:v 1 -vf 'scale=960:-2' -q:v 3 apps/preview/public/media/pexels/autumn-temple.jpg
```

Эти команды — инструкция, а не отчёт о выполненной конвертации. Они не обрезают
ролики ради достижения заданной длительности и не добавляют музыку/звук. Если у
оригинала нет аудио, оно не синтезируется. Сохраняйте только звук с проверенными правами.

```sh
ffprobe -v error -show_entries format=duration,size:stream=codec_name,codec_type,width,height,pix_fmt \
  -of json apps/preview/public/media/pexels/rainy-day.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,codec_type,width,height,pix_fmt \
  -of json apps/preview/public/media/pexels/autumn-temple.mp4
npm ci
npm run typecheck
npm run build
npm test
```

Текущие версии: H.264, 16:9, 1280×720/60.143 с для дождя и 960×540/14.0 с для храма.
Исходные фильмы без аудиодорожек. Длительность показывает нативное медиа. Постеры
извлечены из соответствующих роликов. При замене файлов проверяйте метаданные заново. После добавления файлов
пересоберите/перезагрузите страницу: MA проверяет HEAD-ответы MP4 и постера с корректным
MIME и автоматически включает соответствующий слот. Метаданные — в `src/films.ts`
внутри `apps/preview/`; менять controls не нужно.

Проверьте оба фильма: постер, воспроизведение, seek 0/50/90%, конец/повтор, volume/mute,
fullscreen, последовательное переключение с клавиатуры и на телефоне. Переключение
останавливает фильм и сбрасывает позицию, сохраняя нативный media-узел и громкость,
если оба слота доступны. Проверьте MP4 MIME и HTTP 206 на конечном хостинге. Нынешние
автотесты переключения используют MDN bytes только как транспортную фикстуру — они
**не подтверждают** подлинность, 60/14 с или права на Pexels-файлы.

## Лицензия и кредиты

Источники и авторы указаны выше и в `public/media/pexels/ATTRIBUTION.md`.
Лицензия источника: **Pexels License**, https://www.pexels.com/license/ .
Условия лицензии необходимо перепроверять перед публикацией,
сохраните сведения о скачанном файле и дату проверки в атрибуции. Это сторонние
стоковые фильмы, не авторская съёмка MA, не CC0 и не автоматически Apache 2.0.
Никакой поддержки/одобрения MA со стороны Pexels или авторов не подразумевается.
