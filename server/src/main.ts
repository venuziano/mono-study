import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { AppEnvConfigService } from './config/environment-variables/app-env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Retrieve the configuration service instance
  const configService = app.get(AppEnvConfigService);

  // Use the configuration service to get the port
  const port = configService.apiPort;

  // Listen on the port specified by the configuration service
  await app.listen(port);
}
bootstrap();
