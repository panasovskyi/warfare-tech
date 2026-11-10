# Публікація: чекліст

Усе з теки `ingestion`. Деталі й помилки: `STEPS.md`. Скрізь `1` це номер чернетки (його друкує `npm start`).

## Англійське джерело

1. `npm start -- <адреса> [YYYY-MM-DD]`
2. Фото в `photos/`
3. `npm run image -- --credit="Автор"`
4. Відкрити `drafts/1.md`: прибрати `**`, виправити `problems` і `warnings`, перевірити `photoCredit` і `photoAlt` (необов'язковий)
5. `npm run pub -- 1 --dry-run`
6. `npm run pub -- 1` (без фото або без `photoCredit` спитає `y/n`)

## Українське джерело

1. `npm start -- <адреса> YYYY-MM-DD` (дата обов'язкова для defence-ua.com)
2. Фото в `photos/`
3. `npm run image -- --credit="Автор"`
4. Відкрити `drafts/1.uk.md`: переписати виділене, прибрати `**`
5. `npm run translate -- 1.uk`
6. Відкрити `drafts/1.md`: виправити `problems` і `warnings`, перевірити `photoCredit`, `photoAlt` (необов'язковий), заголовок і видання (одна згадка)
7. `npm run pub -- 1 --dry-run`
8. `npm run pub -- 1`

## Не можна

- Публікувати `1.uk.md` і `1.pre-translation.md`
- Вставляти в текст картинки й відео, доки фронт їх не вміє малювати (звичайні посилання можна)
