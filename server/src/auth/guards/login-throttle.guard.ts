import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// TODO: тіло відповіді 429 — рядок, а не об'єкт: ThrottlerException несе лише текст, і
// ExceptionsFilter віддає його як JSON-рядок замість { message }. Перевизначити тут
// throwThrottlingException і кидати ApiError зі статусом 429
@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  // TODO: лічильник за identifier дозволяє закрити вхід адміну: логін видно в адресі
  // /authors/admin, і 5 чужих запитів на хвилину з ним дають 429 і власнику (і npm run pub).
  // Вирішити: лишити так (перебір обмежено з будь-яких адрес) чи рахувати за IP разом з
  // identifier (заблокувати не вийде, але перебір з багатьох адрес не обмежений; потрібен
  // trust proxy)
  // TODO: запити з різними вигаданими логінами не обмежені взагалі: кожен новий identifier —
  // новий лічильник, тож такий потік доходить до бази
  protected getTracker(req: Record<string, any>): Promise<string> {
    const body = req.body as { identifier?: unknown } | undefined;

    const identifier =
      typeof body?.identifier === 'string'
        ? body.identifier.trim().toLowerCase()
        : '';
    return Promise.resolve(identifier || req.ip);
  }
}
