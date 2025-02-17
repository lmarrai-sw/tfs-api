import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';

import { DateModule } from '../date/date.module';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        maxRedirects: configService.get<number>('acbs.maxRedirects'),
        timeout: configService.get<number>('acbs.timeout'),
      }),
    }),
    AcbsModule,
    DateModule,
  ],
  controllers: [PartyController],
  providers: [PartyService],
})
export class PartyModule {}
