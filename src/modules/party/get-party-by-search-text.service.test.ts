import { HttpService } from '@nestjs/axios';
import { GetPartyBySearchTextFailedException } from '@ukef/modules/party/exception/get-party-by-search-text-failed.exception';
import { GetPartyBySearchTextService } from '@ukef/modules/party/get-party-by-search-text.service';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';
import { AcbsGetPartyBySearchTextResponseElement } from './dto/acbs-get-party-by-search-text-response-element.dto';

describe('GetPartyBySearchTextService', () => {
  const config = { baseUrl: 'the base url' };
  const idToken = 'the id token';

  let httpService: HttpService;
  let getPartyBySearchTextService: GetPartyBySearchTextService;

  const getExpectedGetPartyBySearchTextArguments = (searchText: string): [string, object] => [
    '/Party/Search/' + searchText,
    {
      baseURL: 'the base url',
      headers: {
        Authorization: 'Bearer ' + idToken,
      },
    },
  ];

  const acbsResponse: AcbsGetPartyBySearchTextResponseElement[] = [
    {
      PartyAlternateIdentifier: '00309999',
      IndustryClassification: { IndustryClassificationCode: '2401' },
      PartyName1: 'ACTUAL IMPORT EXPORT',
      PartyName2: '',
      PartyName3: '',
      MinorityClass: { MinorityClassCode: '20' },
      CitizenshipClass: { CitizenshipClassCode: '2' },
      OfficerRiskDate: '2018-03-21T00:00:00Z',
      PrimaryAddress: { Country: { CountryCode: 'DZA' } },
    },
    {
      PartyAlternateIdentifier: '00999999',
      IndustryClassification: { IndustryClassificationCode: '0001' },
      PartyName1: 'AV 2022-10-1039',
      PartyName2: '',
      PartyName3: '',
      MinorityClass: { MinorityClassCode: '70' },
      CitizenshipClass: { CitizenshipClassCode: '1' },
      OfficerRiskDate: '2022-10-10T00:00:00Z',
      PrimaryAddress: { Country: { CountryCode: 'GBR' } },
    },
  ];

  const acbsResponseWithNullOfficerRiskDate: AcbsGetPartyBySearchTextResponseElement[] = [
    {
      PartyAlternateIdentifier: '00309999',
      IndustryClassification: { IndustryClassificationCode: '2401' },
      PartyName1: 'ACTUAL IMPORT EXPORT',
      PartyName2: '',
      PartyName3: '',
      MinorityClass: { MinorityClassCode: '20' },
      CitizenshipClass: { CitizenshipClassCode: '2' },
      OfficerRiskDate: null,
      PrimaryAddress: { Country: { CountryCode: 'DZA' } },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();
    getPartyBySearchTextService = new GetPartyBySearchTextService(config, httpService);
  });

  describe('successful request', () => {
    it('returns matching parties in the correct format if the request is successful', async () => {
      const searchText = 'searchText';

      mockSuccessfulAcbsGetPartyBySearchTextRequest(searchText, acbsResponse);

      const response = await getPartyBySearchTextService.getPartyBySearchText(idToken, searchText);

      expect(response).toStrictEqual([
        {
          alternateIdentifier: '00309999',
          industryClassification: '2401',
          name1: 'ACTUAL IMPORT EXPORT',
          name2: '',
          name3: '',
          smeType: '20',
          citizenshipClass: '2',
          officerRiskDate: '2018-03-21',
          countryCode: 'DZA',
        },
        {
          alternateIdentifier: '00999999',
          industryClassification: '0001',
          name1: 'AV 2022-10-1039',
          name2: '',
          name3: '',
          smeType: '70',
          citizenshipClass: '1',
          officerRiskDate: '2022-10-10',
          countryCode: 'GBR',
        },
      ]);
    });

    it('returns matching parties in the correct format if the query parameter searchText is exactly 3 characters and the request is successful', async () => {
      const searchText = '999';

      mockSuccessfulAcbsGetPartyBySearchTextRequest(searchText, acbsResponse);

      const response = await getPartyBySearchTextService.getPartyBySearchText(idToken, searchText);

      expect(response).toStrictEqual([
        {
          alternateIdentifier: '00309999',
          industryClassification: '2401',
          name1: 'ACTUAL IMPORT EXPORT',
          name2: '',
          name3: '',
          smeType: '20',
          citizenshipClass: '2',
          officerRiskDate: '2018-03-21',
          countryCode: 'DZA',
        },
        {
          alternateIdentifier: '00999999',
          industryClassification: '0001',
          name1: 'AV 2022-10-1039',
          name2: '',
          name3: '',
          smeType: '70',
          citizenshipClass: '1',
          officerRiskDate: '2022-10-10',
          countryCode: 'GBR',
        },
      ]);
    });

    it('returns matching parties in the correct format in the case that there is a null officerRiskDate and the request is successful', async () => {
      const searchText = 'searchText';

      mockSuccessfulAcbsGetPartyBySearchTextRequest(searchText, acbsResponseWithNullOfficerRiskDate);

      const response = await getPartyBySearchTextService.getPartyBySearchText(idToken, searchText);

      expect(response).toStrictEqual([
        {
          alternateIdentifier: '00309999',
          industryClassification: '2401',
          name1: 'ACTUAL IMPORT EXPORT',
          name2: '',
          name3: '',
          smeType: '20',
          citizenshipClass: '2',
          officerRiskDate: null,
          countryCode: 'DZA',
        },
      ]);
    });
  });

  describe('failed request', () => {
    it('throws a GetPartyBySearchTextFailedException if there is an error when getting parties from ACBS', async () => {
      const searchText = 'searchText';
      const getPartyError = new AxiosError();

      // eslint-disable-next-line jest/unbound-method
      when(httpService.get)
        .calledWith(...getExpectedGetPartyBySearchTextArguments(searchText))
        .mockReturnValueOnce(throwError(() => getPartyError));

      const responsePromise = getPartyBySearchTextService.getPartyBySearchText(idToken, searchText);

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartyBySearchTextFailedException);
      await expect(responsePromise).rejects.toThrow('Failed to get parties from ACBS.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', getPartyError);
    });

    it('throws a GetPartyBySearchTextFailedException if the required query parameter searchText is not specified', async () => {
      const responsePromise = getPartyBySearchTextService.getPartyBySearchText(idToken, null);

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartyBySearchTextFailedException);
      await expect(responsePromise).rejects.toThrow('The required query parameter searchText was not specified.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', undefined);
    });

    it('throws a GetPartyBySearchTextFailedException if the query parameter searchText is empty', async () => {
      const responsePromise = getPartyBySearchTextService.getPartyBySearchText(idToken, '');

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartyBySearchTextFailedException);
      await expect(responsePromise).rejects.toThrow('The query parameter searchText must be non-empty.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', undefined);
    });

    it('throws a GetPartyBySearchTextFailedException if the query parameter searchText is less than 3 characters', async () => {
      const responsePromise = getPartyBySearchTextService.getPartyBySearchText(idToken, '00');

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartyBySearchTextFailedException);
      await expect(responsePromise).rejects.toThrow('The query parameter searchText must be at least 3 characters.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', undefined);
    });
  });

  function mockSuccessfulAcbsGetPartyBySearchTextRequest(searchText: string, response: AcbsGetPartyBySearchTextResponseElement[]): void {
    // eslint-disable-next-line jest/unbound-method
    when(httpService.get)
      .calledWith(...getExpectedGetPartyBySearchTextArguments(searchText))
      .mockReturnValueOnce(
        of({
          data: response,
          status: 200,
          statusText: 'OK',
          config: undefined,
          headers: undefined,
        }),
      );
  }
});
