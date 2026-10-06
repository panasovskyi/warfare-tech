# Публікація: чекліст

Усе з теки `ingestion`. Деталі й помилки: `STEPS.md`.

## Англійське джерело

1. `npm start -- <адреса> [YYYY-MM-DD]`
2. Фото в `photos/`
3. `npm run attach-image -- --credit="Автор"`
4. Відкрити `drafts/….md`: прибрати `**`, виправити `problems` і `warnings`, перевірити `photoCredit`
5. `npm run publish-draft -- drafts/….md --dry-run`
6. `npm run publish-draft -- drafts/….md`

## Українське джерело

1. `npm start -- <адреса> YYYY-MM-DD` (дата обов'язкова для defence-ua.com)
2. Фото в `photos/`
3. `npm run attach-image -- --credit="Автор"`
4. Відкрити `drafts/….uk.md`: переписати виділене, прибрати `**`
5. `npm run translate -- drafts/….uk.md`
6. Відкрити `drafts/….md`: виправити `problems` і `warnings`, перевірити `photoCredit`, заголовок і видання (одна згадка)
7. `npm run publish-draft -- drafts/….md --dry-run`
8. `npm run publish-draft -- drafts/….md`

## Не можна

- Публікувати `….uk.md` і `….pre-translation.md`
- Вставляти в текст картинки й відео, доки фронт їх не вміє малювати (звичайні посилання можна)
