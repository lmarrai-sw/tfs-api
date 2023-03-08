import { Injectable } from '@nestjs/common';

import { AcbsAuthenticationService } from '../acbs/acbs-authentication.service';
import { AcbsPartyService } from '../acbs/acbs-party.service';
import { Party } from './party.interface';

@Injectable()
export class PartyService {
  constructor(private readonly acbsAuthenticationService: AcbsAuthenticationService, private readonly acbsPartyService: AcbsPartyService) {}

  async getPartyByIdentifier(partyIdentifier: string): Promise<Party> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const partyInAcbs = await this.acbsPartyService.getPartyByIdentifier(partyIdentifier, idToken);
    return {
      alternateIdentifier: partyInAcbs.PartyAlternateIdentifier,
      industryClassification: partyInAcbs.IndustryClassification.IndustryClassificationCode,
      name1: partyInAcbs.PartyName1,
      name2: partyInAcbs.PartyName2,
      name3: partyInAcbs.PartyName3,
      smeType: partyInAcbs.MinorityClass.MinorityClassCode,
      citizenshipClass: partyInAcbs.CitizenshipClass.CitizenshipClassCode,
      officerRiskDate: partyInAcbs.OfficerRiskDate && partyInAcbs.OfficerRiskDate.split('T')[0],
      countryCode: partyInAcbs.PrimaryAddress.Country.CountryCode,
    };
  }
}
