import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations, UkefId } from '@ukef/helpers';
import { AcbsAuthenticationService } from '@ukef/modules/acbs/acbs-authentication.service';
import { AcbsDealPartyService } from '@ukef/modules/acbs/acbs-deal-party.service';
import { AcbsResourceNotFoundException } from '@ukef/modules/acbs/exception/acbs-resource-not-found.exception';

import { DealInvestor } from './deal-investor.interface';

@Injectable()
export class DealInvestorService {
  // TODO: make DateStringTransformations injectable, maybe it needs to be part of module for this to work.
  private readonly dateStringTransformations: DateStringTransformations = new DateStringTransformations();

  constructor(private readonly acbsAuthenticationService: AcbsAuthenticationService, private readonly acbsDealPartyService: AcbsDealPartyService) {}

  async getDealInvestors(dealIdentifier: UkefId): Promise<DealInvestor[]> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const portfolio = PROPERTIES.GLOBAL.portfolioIdentifier;
    const investorsInAcbs = await this.acbsDealPartyService.getDealPartiesForDeal(portfolio, dealIdentifier, idToken);
    if (!investorsInAcbs) {
      throw new AcbsResourceNotFoundException(`Deal Investors for Deal ${dealIdentifier} were not found by ACBS.`);
    }
    return investorsInAcbs.map((investorInAcbs) => ({
      dealIdentifier,
      portfolioIdentifier: portfolio,
      lenderType: { LenderTypeCode: investorInAcbs.LenderType.LenderTypeCode },
      effectiveDate: this.dateStringTransformations.removeTimeIfExists(investorInAcbs.EffectiveDate),
      expiryDate: this.dateStringTransformations.removeTimeIfExists(investorInAcbs.ExpirationDate),
      isExpiryDateMaximum: investorInAcbs.IsExpirationDateMaximum,
      maximumLiability: investorInAcbs.LimitAmount,
    }));
  }
}
