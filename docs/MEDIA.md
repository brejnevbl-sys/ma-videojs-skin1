# Медиа MA и технического workbench

Главная страница `/` и её alias `/ma.html` используют `films` из
`apps/preview/src/films.ts`: Rainy Day — Roberto Lee Cortes (60.143417 с) и
Serene Japanese Temple in Autumn Forest — Hideyoshi isai (14 с).
Это сторонние стоковые фильмы Pexels, не наша собственная видеосъёмка.
Все четыре MP4/JPG уже в Git, повторная загрузка не нужна. Оба фильма без звука.

`/workbench/` и `/preview.html` используют отдельную запись `demoFilm` из
`apps/preview/src/media.ts`: технический MDN flower sample с отдельной CC0-атрибуцией.
Он не подменяет фильмы на главной странице. Изменение `demoFilm` меняет только
техническую демонстрацию.

## Замена фильма без изменения controls

1. Добавьте MP4 и отдельный постер в `apps/preview/public/media/`. Предпочтительны
   H.264/yuv420p, fast start (moov перед mdat), умеренный битрейт и 16:9. Добавляйте
   AAC только при наличии исходного звука и прав на него; не синтезируйте звук.
2. Для публичной страницы измените нужную запись в `apps/preview/src/films.ts`:
   `src`, `poster`, `title`, `description`, `author`, `source`, `expectedSeconds`,
   `silent` и `attribution`. Для технических маршрутов — отдельно `demoFilm`.
   Пути формируются через `sitePath`, чтобы учитывать Vite BASE_URL.
3. Обновите атрибуцию рядом с файлами: автор, название, источник и отдельные условия
   использования изображения/звука. Не называйте стоковое видео авторским фильмом MA.
4. Перепроверьте файлы через ffprobe и полную декодировку FFmpeg. Обновите ожидания
   `tests/real-films.spec.ts` по фактическим длительности, размерам и именам файлов.
   Выполните TypeScript, production build, Playwright и Axe.
5. Проверьте конечный хостинг: загрузку постеров, MIME `video/mp4`, HTTP 206/ranges,
   play/pause, seek, mute, fullscreen и переключение на физическом Android/iOS.

`Player` принимает типизированный `film`; `src/video/` менять не нужно. Video.js
читает длительность, время, буферизацию и ошибки из настоящего HTMLVideoElement.
`FilmGallery` сохраняет video-узел при переключении, ставит старый фильм на паузу
до смены src, сбрасывает время нового фильма и сохраняет громкость/mute.

Основной target — корень домена (`base: '/'`). Для подкаталога нужен абсолютный
префикс base, например `/ma/`; относительный `./` не предназначен для вложенного workbench.

Apache 2.0 в корне относится к исходному коду. Pexels License относится к двум
стоковым фильмам и их постерам; MDN sample имеет отдельную CC0-атрибуцию.
См. [PEXELS.md](PEXELS.md), публичный
[ATTRIBUTION.md](../apps/preview/public/media/pexels/ATTRIBUTION.md) и
[отчёт настоящих медиа](PR7-REAL-MEDIA-QA.md).
