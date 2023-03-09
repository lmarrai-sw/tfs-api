import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AcbsModule } from '@ukef/module/acbs/acbs.module';

import { GetPartyBySearchTextService } from './get-party-by-search-text.service';
import { PartyController } from './party.controller';
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
  ],
  controllers: [PartyController],
  providers: [GetPartyBySearchTextService],
})
export class PartyModule {}
