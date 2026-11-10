import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionsFilter } from 'src/exceptions/exceptions.filter';

async function bootstrap() {
  // TODO: увімкнути trust proxy: за проксі Render req.ip — адреса проксі, а не клієнта. Зараз це
  // зачіпає лише запасний req.ip у LoginThrottlerGuard і тротлінг register; стане критичним,
  // якщо лічильник логіну рахуватиме й IP
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: [process.env.CLIENT_URL], credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ExceptionsFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
