import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/module/acbs/acbs.module';

import { AcbsAdapterModule } from './acbs-adapter/acbs-adapter.module';
import { AcbsPartyExternalRatingsProvider } from './acbs-adapter/acbs-party-external-ratings.provider';
import { PartyModule } from './party/party.module';
import { PartyExternalRatingModule } from './party-external-rating/party-external-rating.module';

@Module({
  imports: [
    AcbsModule,
    PartyExternalRatingModule.register({
      imports: [AcbsAdapterModule, AcbsModule],
      partyExternalRatingsProviderClass: AcbsPartyExternalRatingsProvider,
    }),
    PartyModule,
  ],
  exports: [PartyExternalRatingModule, AcbsModule, PartyModule],
})
export class TfsModule {}
