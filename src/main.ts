import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';

import { configService } from './shared/Services/config.service';

import { UIModule } from './ui/ui.module';
import { CMSModule } from './cms/cms.module';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Tiktok APIs')
    .setDescription('Tiktok APIs')
    .setVersion('2.0')
    // .addTag('')
    .build();

  // Create Swagger doc for UI modules
  const uiApisDocOptions: SwaggerDocumentOptions = {
      include: [ UIModule ],
      deepScanRoutes: true
  };
  const cmsApisDoc = SwaggerModule.createDocument(app, config, uiApisDocOptions);
  SwaggerModule.setup('swagger-ui', app, cmsApisDoc);

  // Create Swagger doc for CMS modules
  const cmsApisDocOptions: SwaggerDocumentOptions = {
    include: [ CMSModule ],
    deepScanRoutes: true
  };
  const uiApisDoc = SwaggerModule.createDocument(app, config, cmsApisDocOptions);
  SwaggerModule.setup('swagger-cms', app, uiApisDoc);

  // Start application
  await app.listen(configService.getHostPort());
}
bootstrap();
