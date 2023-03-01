jest.mock('@nestjs/axios');
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { when } from 'jest-when';
jest.mock('@ukef/modules/acbs/acbs-authentication.service');
import { GetPartyBySearchTextService } from '@ukef/modules/party/get-party-by-search-text.service';
import { GetPartyBySearchTextFailedException } from '@ukef/modules/party/get-party-by-search-text-failed.exception';
import { AxiosError, AxiosResponse } from 'axios';

// eslint-disable-next-line jest/unbound-method
describe('PartyController', () => {
    const config = {baseUrl: "the base url"};
    const idToken = 'the id token';
    const searchText = 'searchText';

    let httpService: HttpService;
    let getPartyBySearchTextService: GetPartyBySearchTextService;

    const expectedGetPartyBySearchTextArguments: [string, object] = [
        '/Party/Search/' + searchText,
        { 
            baseURL: 'the base url',
            headers: {
                "Authorization" : "Bearer " + idToken
            }
        }
    ];

    const acbsResponse = [{
        PartyAlternateIdentifier: "00309999",
        IndustryClassification: {IndustryClassificationCode: "2401"},
        PartyName1: "ACTUAL IMPORT EXPORT",
        PartyName2: "",
        PartyName3: "",
        MinorityClass: {MinorityClassCode: "20"},
        CitizenshipClass: {CitizenshipClassCode: "2"},
        OfficerRiskDate: "2018-03-21T00:00:00Z",
        PrimaryAddress: {Country: {CountryCode: "DZA"}} 
    }];
    
    beforeEach(() => {
        httpService = new HttpService();
        getPartyBySearchTextService = new GetPartyBySearchTextService(config, httpService);
    });

    describe('successful request', () => {
        it('returns matching party/parties in the correct format if the request is successful', async () => {
            mockSuccessfulAcbsGetPartyBySearchTextRequest();
            
            const response = await getPartyBySearchTextService.getPartyBySearchText(idToken, searchText);

            expect(response).toStrictEqual([{
                alternateIdentifier: "00309999",
                industryClassification: "2401",
                name1: "ACTUAL IMPORT EXPORT",
                name2: "",
                name3: "",
                smeType: "20",
                citizenshipClass: "2",
                officerRiskDate: "2018-03-21",
                countryCode: "DZA"
            }]);
        });
    });

    describe('failed request', () => {
        it('throws a GetPartyBySearchTextFailedException if there is an error when getting parties from ACBS', async () => {
            const getPartyError = new AxiosError();

            // eslint-disable-next-line jest/unbound-method
            when(httpService.get)
                .calledWith(...expectedGetPartyBySearchTextArguments)
                .mockReturnValueOnce(throwError(() => getPartyError));

            const responsePromise = getPartyBySearchTextService.getPartyBySearchText(idToken, searchText);

            await expect(responsePromise)
                .rejects.toBeInstanceOf(GetPartyBySearchTextFailedException);
            await expect(responsePromise)
                .rejects.toThrowError('Failed to get parties from ACBS.');
            await expect(responsePromise)
                .rejects.toHaveProperty('innerError', getPartyError);
        });

        it('throws a GetPartyBySearchTextFailedException if the required query parameter searchText is not specified', async () => {
            const responsePromise = getPartyBySearchTextService.getPartyBySearchText(idToken, null);

            await expect(responsePromise)
                .rejects.toBeInstanceOf(GetPartyBySearchTextFailedException);
            await expect(responsePromise)
                .rejects.toThrowError('The required query parameter searchText was not specified.');
            await expect(responsePromise)
                .rejects.toHaveProperty('innerError', undefined);
        });

        it('throws a GetPartyBySearchTextFailedException if the query parameter searchText is empty', async () => {
            const responsePromise = getPartyBySearchTextService.getPartyBySearchText(idToken, '');

            await expect(responsePromise)
                .rejects.toBeInstanceOf(GetPartyBySearchTextFailedException);
            await expect(responsePromise)
                .rejects.toThrowError('The query parameter searchText must be non-empty.');
            await expect(responsePromise)
                .rejects.toHaveProperty('innerError', undefined);
        });

        it('throws a GetPartyBySearchTextFailedException if the query parameter searchText is less than 3 characters', async () => {
            const responsePromise = getPartyBySearchTextService.getPartyBySearchText(idToken, '00');

            await expect(responsePromise)
                .rejects.toBeInstanceOf(GetPartyBySearchTextFailedException);
            await expect(responsePromise)
                .rejects.toThrowError('The query parameter searchText must be at least 3 characters.');
            await expect(responsePromise)
                .rejects.toHaveProperty('innerError', undefined);
        });
    });

    function mockSuccessfulAcbsGetPartyBySearchTextRequest(): void {
        // eslint-disable-next-line jest/unbound-method
        when(httpService.get)
            .calledWith(...expectedGetPartyBySearchTextArguments)
            .mockReturnValueOnce(of({
                data: acbsResponse,
                status: 200,
                statusText: 'OK',
                config: undefined,
                headers: undefined,
            }));
    }
});