import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionsFilter } from 'src/exceptions/exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Скільки проксі стоїть перед сервером: від цього залежить req.ip, а на ньому тримається
  // ліміт логіну. Саме число: рядок з env Express прочитав би як адресу, а не кількість
  const trustProxy = Number(process.env.TRUST_PROXY) || 1;

  app.set('trust proxy', trustProxy);
  app.use(helmet());
  app.enableCors({ origin: [process.env.CLIENT_URL!], credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ExceptionsFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
