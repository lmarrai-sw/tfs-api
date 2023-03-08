import { Api } from '@ukef-test/support/api';
import { RandomValueGenerator } from '@ukef-test/support/random-value-generator';
import nock from 'nock';

describe('GET /party?searchText={searchText}', () => {
  const valueGenerator = new RandomValueGenerator();

  const searchText = valueGenerator.stringOfNumericCharacters(3);
  const idToken = valueGenerator.string();

  const partyAlternateIdentifierA = searchText + '0';
  const industryClassificationCodeA = valueGenerator.stringOfNumericCharacters();
  const partyName1A = valueGenerator.string();
  const partyName2A = valueGenerator.string();
  const partyName3A = valueGenerator.string();
  const minorityClassCodeA = valueGenerator.stringOfNumericCharacters();
  const citizenshipClassCodeA = valueGenerator.stringOfNumericCharacters();
  const officerRiskDateA = valueGenerator.date().toISOString();
  const countryCodeA = valueGenerator.string();

  const partyAlternateIdentifierB = searchText + '1';
  const industryClassificationCodeB = valueGenerator.stringOfNumericCharacters();
  const partyName1B = valueGenerator.string();
  const partyName2B = valueGenerator.string();
  const partyName3B = valueGenerator.string();
  const minorityClassCodeB = valueGenerator.stringOfNumericCharacters();
  const citizenshipClassCodeB = valueGenerator.stringOfNumericCharacters();
  const officerRiskDateB = valueGenerator.date().toISOString();
  const countryCodeB = valueGenerator.string();

  const partiesInAcbs = [
    {
      PartyAlternateIdentifier: partyAlternateIdentifierA,
      IndustryClassification: { IndustryClassificationCode: industryClassificationCodeA },
      PartyName1: partyName1A,
      PartyName2: partyName2A,
      PartyName3: partyName3A,
      MinorityClass: { MinorityClassCode: minorityClassCodeA },
      CitizenshipClass: { CitizenshipClassCode: citizenshipClassCodeA },
      OfficerRiskDate: officerRiskDateA,
      PrimaryAddress: { Country: { CountryCode: countryCodeA } },
    },
    {
      PartyAlternateIdentifier: partyAlternateIdentifierB,
      IndustryClassification: { IndustryClassificationCode: industryClassificationCodeB },
      PartyName1: partyName1B,
      PartyName2: partyName2B,
      PartyName3: partyName3B,
      MinorityClass: { MinorityClassCode: minorityClassCodeB },
      CitizenshipClass: { CitizenshipClassCode: citizenshipClassCodeB },
      OfficerRiskDate: officerRiskDateB,
      PrimaryAddress: { Country: { CountryCode: countryCodeB } },
    },
  ];

  const expectedParties = [
    {
      alternateIdentifier: partyAlternateIdentifierA,
      industryClassification: industryClassificationCodeA,
      name1: partyName1A,
      name2: partyName2A,
      name3: partyName3A,
      smeType: minorityClassCodeA,
      citizenshipClass: citizenshipClassCodeA,
      officerRiskDate: officerRiskDateA.slice(0, 10),
      countryCode: countryCodeA,
    },
    {
      alternateIdentifier: partyAlternateIdentifierB,
      industryClassification: industryClassificationCodeB,
      name1: partyName1B,
      name2: partyName2B,
      name3: partyName3B,
      smeType: minorityClassCodeB,
      citizenshipClass: citizenshipClassCodeB,
      officerRiskDate: officerRiskDateB.slice(0, 10),
      countryCode: countryCodeB,
    },
  ];

  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  it('returns a 200 response with the matching parties if they are returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartyBySearchText().reply(200, partiesInAcbs);

    const { status, body } = await api.get(`/api/v1/party?searchText=${searchText}`);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedParties)));
  });

  it('returns a 200 response with an empty array of parties if ACBS returns a 200 response with an empty array of parties', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartyBySearchText().reply(200, []);

    const { status, body } = await api.get(`/api/v1/party?searchText=${searchText}`);

    expect(status).toBe(200);
    expect(body).toStrictEqual([]);
  });

  it('returns a 500 response if creating a session with the IdP fails', async () => {
    const errorCode = valueGenerator.string();
    requestToCreateASessionWithTheIdp().reply(
      400,
      {
        errorCode: errorCode,
        errorStack: null,
        messages: [
          {
            code: errorCode,
            message: `${errorCode}: Invalid Credentials. (msg_id=${valueGenerator.string()})`,
            property: null,
          },
        ],
      },
      {
        'set-cookie': 'JSESSIONID=prelogin-1',
      },
    );

    const { status, body } = await api.get(`/api/v1/party?searchText=${searchText}`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting an id token from the IdP fails', async () => {
    givenCreatingASessionWithTheIdpSucceeds();
    requestToGetAnIdTokenFromTheIdp().reply(403, '<!doctype html><html><body><div>Access to the requested resource has been forbidden.</div></body></html>');

    const { status, body } = await api.get(`/api/v1/party?searchText=${searchText}`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if ACBS returns a status code that is not 200 or 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartyBySearchText().reply(401);

    const { status, body } = await api.get(`/api/v1/party?searchText=${searchText}`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if creating a session with the IdP times out', async () => {
    requestToCreateASessionWithTheIdp().delay(1500).reply(201, '', { 'set-cookie': 'JSESSIONID=1' });
    givenGettingAnIdTokenFromTheIdpSucceeds();
    requestToGetPartyBySearchText().reply(200, partiesInAcbs);

    const { status, body } = await api.get(`/api/v1/party?searchText=${searchText}`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting an id token from the IdP times out', async () => {
    givenCreatingASessionWithTheIdpSucceeds();
    requestToGetAnIdTokenFromTheIdp().delay(1500).reply(200, { id_token: idToken });
    requestToGetPartyBySearchText().reply(200, partiesInAcbs);

    const { status, body } = await api.get(`/api/v1/party?searchText=${searchText}`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the parties from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartyBySearchText().delay(1500).reply(200, partiesInAcbs);

    const { status, body } = await api.get(`/api/v1/party?searchText=${searchText}`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 400 response if the request is sent to /party', async () => {
    const { status, body } = await api.get(`/api/v1/party`);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['searchText must be longer than or equal to 3 characters'],
    });
  });

  it('returns a 400 response if the request is sent to /party?searchText', async () => {
    const { status, body } = await api.get(`/api/v1/party?searchText`);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['searchText must be longer than or equal to 3 characters'],
    });
  });

  it('returns a 400 response if the request is sent to /party?searchText=', async () => {
    const { status, body } = await api.get(`/api/v1/party?searchText=`);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['searchText must be longer than or equal to 3 characters'],
    });
  });

  it('returns a 400 response if searchText is less than 3 characters', async () => {
    const { status, body } = await api.get(`/api/v1/party?searchText=00`);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['searchText must be longer than or equal to 3 characters'],
    });
  });

  const requestToCreateASessionWithTheIdp = (): nock.Interceptor =>
    nock('https://test-acbs-authentication-url.com/base-url')
      .post('/sessions', { loginName: 'test acbs authentication login name', password: 'test acbs authentication password' })
      .matchHeader('content-type', 'application/json')
      .matchHeader('test-acbs-api-key-header-name', 'test acbs api key');

  const givenCreatingASessionWithTheIdpSucceeds = (): void => {
    requestToCreateASessionWithTheIdp().reply(201, '', { 'set-cookie': 'JSESSIONID=1' });
  };

  const requestToGetAnIdTokenFromTheIdp = (): nock.Interceptor =>
    nock('https://test-acbs-authentication-url.com/base-url')
      .get('/idptoken/openid-connect?client_id=test+acbs+authentication+client+id')
      .matchHeader('content-type', 'application/x-www-form-urlencoded')
      .matchHeader('test-acbs-api-key-header-name', 'test acbs api key')
      .matchHeader('cookie', 'JSESSIONID=1');

  const givenGettingAnIdTokenFromTheIdpSucceeds = (): void => {
    requestToGetAnIdTokenFromTheIdp().reply(200, { id_token: idToken });
  };

  const givenAuthenticationWithTheIdpSucceeds = (): void => {
    givenCreatingASessionWithTheIdpSucceeds();
    givenGettingAnIdTokenFromTheIdpSucceeds();
  };

  const requestToGetPartyBySearchText = (): nock.Interceptor =>
    nock('https://test-acbs-url.com/base-url').get(`/Party/Search/${searchText}`).matchHeader('authorization', `Bearer ${idToken}`);
});
