import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';
import { DateModule } from '@ukef/modules/date/date.module';

import { DealController } from './deal.controller';
import { DealService } from './deal.service';

@Module({
  imports: [AcbsModule, DateModule],
  controllers: [DealController],
  providers: [DealService],
})
export class DealModule {}
