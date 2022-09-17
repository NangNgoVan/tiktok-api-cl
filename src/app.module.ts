import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { UIModule } from './ui/ui.module';
import { CMSModule } from './cms/cms.module';

import { configService } from './shared/Services/config.service';

@Module({
  imports: [  UIModule, 
              CMSModule,
              MongooseModule.forRoot(configService.getDbConnStr())
             ],
  controllers: [],
  providers: [],
})
export class AppModule {}
