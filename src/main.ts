import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger: Logger = new Logger();
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http:localhost:3000',
    credentials: true,
  });
  // React apps run on 3000 by default which is why 8000 is being used :)
  const port = process.env.PORT || 8000;
  await app.listen(port);
  logger.log(`Server started on PORT: ${port}`);
}
bootstrap();
