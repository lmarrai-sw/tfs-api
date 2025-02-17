import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsFacilityPartyService } from '@ukef/modules/acbs/acbs-facility-party.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { FacilityInvestorToCreate } from './facility-investor-to-create.interface';

@Injectable()
export class FacilityInvestorService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityPartyService: AcbsFacilityPartyService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async createInvestorForFacility(facilityIdentifier: string, newFacilityInvestor: FacilityInvestorToCreate): Promise<void> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const facilityPartyToCreateInAcbs = {
      FacilityStatus: {
        FacilityStatusCode: PROPERTIES.FACILITY_INVESTOR.DEFAULT.facilityStatus.facilityStatusCode,
      },
      InvolvedParty: {
        PartyIdentifier: PROPERTIES.FACILITY_INVESTOR.DEFAULT.involvedParty.partyIdentifier,
      },
      EffectiveDate: this.dateStringTransformations.addTimeToDateOnlyString(newFacilityInvestor.effectiveDate),
      ExpirationDate: this.dateStringTransformations.addTimeToDateOnlyString(newFacilityInvestor.guaranteeExpiryDate),
      LenderType: {
        LenderTypeCode: newFacilityInvestor.lenderType ?? PROPERTIES.FACILITY_INVESTOR.DEFAULT.lenderType.lenderTypeCode,
      },
      SectionIdentifier: PROPERTIES.FACILITY_INVESTOR.DEFAULT.sectionIdentifier,
      Currency: {
        CurrencyCode: newFacilityInvestor.currency,
      },
      LimitAmount: newFacilityInvestor.maximumLiability,
      CustomerAdvisedIndicator: PROPERTIES.FACILITY_INVESTOR.DEFAULT.customerAdvisedIndicator,
      LimitRevolvingIndicator: PROPERTIES.FACILITY_INVESTOR.DEFAULT.limitRevolvingIndicator,
    };
    await this.acbsFacilityPartyService.createPartyForFacility(facilityIdentifier, facilityPartyToCreateInAcbs, idToken);
  }
}
