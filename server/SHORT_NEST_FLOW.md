# Короткий флоу: Express → Nest

**Модуль**
- Точка входу в сутність — модуль, оголошується декоратором `@Module`.
- У ньому є `imports`, `exports`, `providers` і `controllers`.
- Сервіси підключаються в `providers`, а в `exports` — якщо їх треба використовувати в інших модулях.
- Сервіс отримує залежності (інші сервіси) через конструктор — це робить DI Nest, `new` писати не треба.
- На Prisma-модуль можна повісити декоратор `@Global()`, щоб не імпортувати його в кожен модуль. `PrismaService` при цьому все одно має бути в `exports`, а сам модуль — один раз імпортований в `AppModule`.
- Модулі сутностей підключаються в `imports` головного `AppModule`.

**Контролер**
- `@Controller` поєднує контролер і роутер з Express.

**Помилки**
- Exception filter замість `errorMiddleware`.
- Підключається в `main.ts` через `app.useGlobalFilters(new ExceptionsFilter())`.

**Валідація**
- `ZodValidationPipe` замість `validationMiddleware`.
- Підключається в аргументі відповідного методу через `@Body`, `@Param` чи `@Query`.

**Авторизація і ролі**
- `authMiddleware` замінюється парою `JwtGuard` + декоратор `@CurrentUser()`.
- `roleMiddleware` замінюється парою `RolesGuard` + декоратор `@Roles()`.
- Guard-и підключаються над методом через `@UseGuards(JwtGuard, RolesGuard)` — `JwtGuard` першим.

**JWT**
- `AuthModule` імпортує `JwtModule.register(...)` — це дозволяє використовувати `JwtService` з методами `sign` і `verify` для створення й перевірки токенів.
- Щоб `JwtGuard` працював в інших модулях, `AuthModule` експортує `JwtModule`, а ці модулі імпортують `AuthModule`.
