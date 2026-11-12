# MA — Issue #9: десктопная адаптация и браузерная проверка

Рабочая ветка: `feat/ma-pexels-films`, существующий [PR #7](https://github.com/brejnevbl-sys/ma-videojs-skin1/pull/7).
Исходный HEAD — `0acd475`. Issue #9 сообщает о подтверждённом владельцем Android
Preview этой ревизии. Новый PR, merge, ручной production deploy и отправка Contra не выполнялись.

## Изменения

- Для десктопных окон высотой до 850/650px уменьшены вертикальные отступы. Шрифты,
  цвета и концепция сохранены. Первый столбец hero может сжиматься без переполнения.
- При 1280×720 начало плеера поднялось с ~609 до ~479px; при resize-эквиваленте
  zoom 150% (853×480) — с ~576 до ~382px. Плеер остаётся 16:9 и не выходит за контейнер.
- Во время HEAD-проверки резервируется будущий размер плеера, включая мобильный
  минимум 200px. Успешная загрузка не заменяет короткий placeholder высоким плеером.
- Курсор мыши скрывается по штатному idle-состоянию Video.js и возвращается при
  движении/фокусе. Правило ограничено fine pointer; touch dock сохранён.
- Исправлен ещё один дефект Video.js 10.3.0: после Replay и смены src могло отменяться
  ожидаемое pause-событие, оставляя controls скрытыми. Штатный расчёт видимости теперь
  вызывается также по `emptied`. Нет параллельного playback state или нового таймера.
- Старый hover-патч сохранён. Исправления оформлены последовательными patches 001/002:
  это поддерживает кэш зависимостей, уже содержащий прежний hover fix. Патч 003
  исправляет viewport-границы popup (0,0,clientWidth,clientHeight вместо прямоугольника
  всей страницы); видимые controls больше не создают лишний fixed containing block
  через нулевой translate. Проверены
  старый кэш → обновление, чистый npm ci и повторный postinstall. См. patches/README.md.
- В WebKit обнаружен отдельный CSS anchor bug после scroll: popup смещался ровно
  на scrollY. Для этого движка используется существующий manual-positioning fallback
  Video.js; новый таймер/слайдер не добавлен. Подробности определения движка и патча
  `@videojs/utils` — в patches/README.md. Проверка реального попадания мышью сохранена.
- Native fullscreen проверяется через standard/prefixed API. Desktop engine job
  работает последовательно, чтобы сценарии не конкурировали за фокус окна.

## Фактически выполнено локально

- `npm_config_cache=/tmp/ma-npm-cache npm ci`, `npm run typecheck`, `npm run build` — PASS.
- Google Chrome **157.0.8103.78**, Linux headless: полный набор **46/46 PASS**, включая
  все прежние 35 тестов и 11 новых desktop regressions. После добавления проверки
  ревизии сборки новый desktop-набор дополнительно прошёл **11/11**.
- Microsoft Edge **155.0.4283.62**, официальный Linux binary, headless: **11/11 PASS**
  на той же production-сборке. Это настоящий Edge, а не переименование Chromium project.
- Axe WCAG 2 A/AA, 2.1 AA и 2.2 AA в проверенных состояниях — 0 нарушений.
- `git diff --check` — PASS. Lint-скрипта нет.

Новые тесты не импортируют media fixture и не перехватывают запросы. Оба MP4/JPG
берутся из Git: дождь ~60.143417 с, храм 14 с. Файлы не скачивались и не менялись.
HEAD 200, JPEG/MP4 MIME и GET Range 206 проверены отдельно от декодирования кадров.
Проверены продвижение времени, пауза, pointer seek, volume slider без seek,
Play/Replay/переключение во время playback, неизменность document/video-узла,
нативный fullscreen, Settings и возврат фокуса после Escape. Подпись об отсутствии
аудио сохранена. Мute/volume изменяют нативное состояние; звуковых дорожек у фильмов нет.

Геометрия проверена на 1280×720, 1366×768, 1440×900, 1920×1080, 2560×1440 и 960×720.
Zoom 125%/150% представлен эквивалентным уменьшением CSS viewport до 1024×576 и
853×480, не физическим переключением zoom в меню браузера. Нет горизонтального
скролла, пересечения hero/описания и обрезанных контролов. Кнопки имеют CSS-размер
минимум 44px; геометрические rect округляются до 0.001px из-за Firefox-значения
43.999996px при точном CSS 44px. Требование к реальному CSS-размеру не ослаблено.

Дополнительно проверены Tab/Shift+Tab без ловушки, scoped Space/m/f/стрелки,
мышь, idle/reveal, wheel-scroll по странице, видимый focus и reduced motion.
В Chromium initial layout shift имеет порог <0.01; неподдерживающие LayoutShift API
движки всё равно проходят проверки размеров/геометрии. Неактивный MP4 не загружается
GET-запросом до выбора; оба фильма используют preload=metadata, 4K-загрузок нет.

## CI и Firefox/WebKit

`npm test` сохраняет Chromium-набор с прежними 35 тестами. Команда
`npm run test:desktop:engines` запускает те же 11 desktop-тестов в каждом из Firefox
и WebKit. CDP/touch-тесты Chromium не выдаются за Firefox/Safari-проверку.

Локальная загрузка Firefox 159/WebKit 27.2 из Playwright CDN заблокирована proxy
403 Domain forbidden. Pull официального образа здесь тоже отклонён. В GitHub Actions
добавлен независимый job `desktop-engines` с `mcr.microsoft.com/playwright:v1.65.0-noble`:
браузеры, кодеки и библиотеки включены в образ, apt не нужен. Владение существующим
контейнерным HOME исправлено под его UID для запуска Firefox; переменная HOME не меняется.

CI сохраняет `browser-results` и `desktop-engine-results`, включая JSON результатов,
скриншоты, user-agent/версии, CSS capabilities, MIME/Range-ответы и console/page errors.
Первый сбой каждого движка виден в public diagnostics job. Результат относится к
конкретному SHA, а не к произвольному старому зелёному запуску: см. последние
[проверки ветки](https://github.com/brejnevbl-sys/ma-videojs-skin1/actions?query=branch%3Afeat%2Fma-pexels-films)
и итоговый отчёт с точными run URL. Конфигурация CI сама по себе не доказывает PASS.

## Vercel Preview

https://ma-videojs-skin1-git-feat-ma-pexels-films-brejnevbl-sys.vercel.app/

Прямое соединение из облачной среды блокируется proxy CONNECT 403. Поэтому CI
также запускает 11 настоящих desktop-тестов против публичного Preview. Перед этим
`scripts/wait-for-preview.mjs` сверяет невидимую meta `ma-revision` с SHA ветки PR,
ожидая текущий Deployment, а не старый сайт. Авторизация и TLS не отключаются;
401/403 приводят к явной ошибке. Результаты и фото Preview хранятся отдельно в
`browser-results/vercel`, с его собственным results.json и сетевыми журналами.
Локальные MIME/Range не выдаются за проверку CDN; фактический статус Preview test
отмечен отдельно в CI/итоговом отчёте.

Независимая проверка CI установила **Vercel Authentication**: Preview перенаправляет
на `https://vercel.com/login`. Ready означает успешную сборку, но не публичный доступ.
До изменения Deployment Protection владельцем проверка публичного Preview остаётся
FAIL; её не пропускают ради зелёного CI. Запрос владельцу отправлен отдельно;
настройки Vercel/production и секреты самостоятельно не менялись.

## Доказательства и ограничения

Фото ниже получены локально в настоящем Chrome с обоими MP4; JSON рядом содержит
версию, capabilities и сетевые ответы. Ошибок console/page в этих сценариях нет.

| Ширина | Композиция | Дождь играет | Второй фильм | Громкость | Settings | Fullscreen |
| --- | --- | --- | --- | --- | --- | --- |
| 1366 | [страница](visuals/issue9/chrome-1366-page.png) | [кадр](visuals/issue9/chrome-1366-rainy-day-playing.png) | [храм](visuals/issue9/chrome-1366-autumn-temple-playing.png) | [popup](visuals/issue9/chrome-1366-volume.png) | [меню](visuals/issue9/chrome-1366-settings.png) | [экран](visuals/issue9/chrome-1366-fullscreen.png) |
| 1920 | [страница](visuals/issue9/chrome-1920-page.png) | [кадр](visuals/issue9/chrome-1920-rainy-day-playing.png) | [храм](visuals/issue9/chrome-1920-autumn-temple-playing.png) | [popup](visuals/issue9/chrome-1920-volume.png) | [меню](visuals/issue9/chrome-1920-settings.png) | [экран](visuals/issue9/chrome-1920-fullscreen.png) |

[Chrome network](visuals/issue9/chrome-1366-network.json),
[Edge network](visuals/issue9/edge-1366-network.json), [геометрия](visuals/issue9/layout.jsonl).

Это автоматизированные Linux browser tests. macOS Safari, Windows Chrome/Edge,
ручные скринридеры и физический Android после этих изменений отдельно не проверялись.
Мобильные viewport/touch-регрессии проходят; подтверждение владельца реального
Android для исходного Preview записано в Issue #9. Старые версии без современных
CSS API не объявляются проверенными. Лицензии Apache/Pexels и кредиты сохранены.

## Отдельный PR #8

Шрифт не переносился. После merge PR #7 потребуется rebase PR #8 и согласование
изменений demo/style.css и video/ma.css. Сохранить новые spacing/cursor/loading rules
и патчи. Большие hero/wordmark метрики East Sea Dokdo необходимо перепроверить на
тех же разрешениях, zoom и 240/320/390px, при загруженном и недоступном шрифте.
Font swap может добавить layout shift; отдельно проверить ширину header и высоту
error dialog. См. [план совмещения](DESKTOP-PLAN.md).
