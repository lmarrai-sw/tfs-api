import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import AcbsConfig from '../../config/acbs.config';
import { AcbsGetPartyBySearchTextResponseElement } from './dto/acbs-get-party-by-search-text-response-element.dto';
import { GetPartyBySearchTextResponseElement } from './dto/get-party-by-search-text-response-element.dto';
import { GetPartyBySearchTextFailedException } from './get-party-by-search-text-failed.exception';

@Injectable()
export class GetPartyBySearchTextService {
  private static readonly path = '/Party/Search';

  constructor(
    @Inject(AcbsConfig.KEY)
    private readonly config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>,
    private readonly httpService: HttpService,
  ) {}

  async getPartyBySearchText(token: string, searchText: string): Promise<GetPartyBySearchTextResponseElement[]> {
    if (searchText === null) {
      throw new GetPartyBySearchTextFailedException('The required query parameter searchText was not specified.');
    }

    if (searchText === '') {
      throw new GetPartyBySearchTextFailedException('The query parameter searchText must be non-empty.');
    }

    if (typeof searchText === 'string' && searchText.length < 3) {
      throw new GetPartyBySearchTextFailedException('The query parameter searchText must be at least 3 characters.');
    }

    const acbsRequest = {
      baseURL: this.config.baseUrl,
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };

    const response = await lastValueFrom(
      this.httpService.get<AcbsGetPartyBySearchTextResponseElement[]>(GetPartyBySearchTextService.path + '/' + searchText, acbsRequest),
    )
      .then((acbsResponse) =>
        acbsResponse.data.map((element) => ({
          alternateIdentifier: element.PartyAlternateIdentifier,
          industryClassification: element.IndustryClassification.IndustryClassificationCode,
          name1: element.PartyName1,
          name2: element.PartyName2,
          name3: element.PartyName3,
          smeType: element.MinorityClass.MinorityClassCode,
          citizenshipClass: element.CitizenshipClass.CitizenshipClassCode,
          officerRiskDate: element.OfficerRiskDate.slice(0, 10),
          countryCode: element.PrimaryAddress.Country.CountryCode,
        })),
      )
      .catch((error) => {
        throw new GetPartyBySearchTextFailedException('Failed to get parties from ACBS.', error);
      });

    return response;
  }
}
