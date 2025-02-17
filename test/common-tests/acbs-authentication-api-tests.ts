import { ACBS } from '@ukef/constants';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_AUTHENTICATION_TIMEOUT } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { waitForAcbsAuthenticationIdTokenCacheToExpire } from '@ukef-test/support/wait-for';
import nock from 'nock';
import request from 'supertest';

interface AcbsAuthenticationErrorCasesTestOptions {
  givenRequestWouldOtherwiseSucceed: () => void;
  makeRequest: () => request.Test;
  successStatusCode?: number;
}

interface AcbsAuthenticationTestHooks {
  idToken: string;
  givenAuthenticationWithTheIdpSucceeds: () => void;
}

// Note that these tests assume the caller will use nock to abort pending requests
// and clean all mocks after each test
export const withAcbsAuthenticationApiTests = ({
  givenRequestWouldOtherwiseSucceed,
  makeRequest,
  successStatusCode: successStatusCodeOrUndefined,
}: AcbsAuthenticationErrorCasesTestOptions): AcbsAuthenticationTestHooks => {
  const successStatusCode = successStatusCodeOrUndefined ?? 200;

  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const creatingASessionErrorCode = valueGenerator.string();
  const sessionId = valueGenerator.string();

  const numberOfAttemptsBeforeAuthenticationFailure = ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_MAX_NUMBER_OF_RETRIES;
  const numberOfAttemptsForAuthenticationFailure = numberOfAttemptsBeforeAuthenticationFailure + 1;

  describe('during ACBS authentication', () => {
    beforeEach(async () => {
      await waitForAcbsAuthenticationIdTokenCacheToExpire();
    });

    afterAll(async () => {
      await waitForAcbsAuthenticationIdTokenCacheToExpire();
    });

    it('returns a 500 response if creating a session with the IdP fails', async () => {
      givenCreatingASessionWithTheIdpFails({ times: numberOfAttemptsForAuthenticationFailure });
      givenRequestWouldOtherwiseSucceed();

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });

    it('returns a 500 response if getting an id token from the IdP fails', async () => {
      givenCreatingASessionWithTheIdpSucceeds({ times: numberOfAttemptsForAuthenticationFailure });
      givenGettingAnIdTokenFromTheIdpFails({ times: numberOfAttemptsForAuthenticationFailure });
      givenRequestWouldOtherwiseSucceed();

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });

    it('returns a 500 response if getting an id token from the IdP times out', async () => {
      givenCreatingASessionWithTheIdpSucceeds({ times: numberOfAttemptsForAuthenticationFailure });
      requestToGetAnIdTokenFromTheIdp()
        .times(numberOfAttemptsForAuthenticationFailure)
        .delay(TIME_EXCEEDING_ACBS_AUTHENTICATION_TIMEOUT)
        .reply(200, { id_token: idToken });
      givenRequestWouldOtherwiseSucceed();

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });

    it('returns a 500 response if creating a session with the IdP times out', async () => {
      requestToCreateASessionWithTheIdp()
        .times(numberOfAttemptsForAuthenticationFailure)
        .delay(TIME_EXCEEDING_ACBS_AUTHENTICATION_TIMEOUT)
        .reply(201, '', { 'set-cookie': `${ACBS.AUTHENTICATION.SESSION_ID_COOKIE_NAME}=${sessionId}` });
      givenGettingAnIdTokenFromTheIdpSucceeds();
      givenRequestWouldOtherwiseSucceed();

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });

    it(`returns a success status code if creating a session and getting an id token both succeed on the final attempt (retrying ${ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_MAX_NUMBER_OF_RETRIES} time(s))`, async () => {
      givenCreatingASessionWithTheIdpFails({ times: numberOfAttemptsBeforeAuthenticationFailure });
      givenCreatingASessionWithTheIdpSucceeds();
      givenGettingAnIdTokenFromTheIdpSucceeds();
      givenRequestWouldOtherwiseSucceed();

      const { status } = await makeRequest();

      expect(status).toBe(successStatusCode);
    });
  });

  const givenCreatingASessionWithTheIdpSucceeds = ({ times }: { times: number } = { times: 1 }): void =>
    givenCreatingASessionWithTheIdpSucceedsWith({ sessionId, times });

  const givenCreatingASessionWithTheIdpFails = ({ times }: { times: number }): void => {
    requestToCreateASessionWithTheIdp()
      .times(times)
      .reply(
        400,
        {
          errorCode: creatingASessionErrorCode,
          errorStack: null,
          messages: [
            {
              code: creatingASessionErrorCode,
              message: `${creatingASessionErrorCode}: Invalid Credentials. (msg_id=${valueGenerator.string()})`,
              property: null,
            },
          ],
        },
        {
          'set-cookie': `${ACBS.AUTHENTICATION.SESSION_ID_COOKIE_NAME}=prelogin-1`,
        },
      );
  };

  const requestToGetAnIdTokenFromTheIdp = (): nock.Interceptor => requestToGetAnIdTokenFromTheIdpFor({ sessionId });

  const givenGettingAnIdTokenFromTheIdpSucceeds = (): void => givenGettingAnIdTokenFromTheIdpSucceedsWith({ idToken, forSessionId: sessionId });

  const givenGettingAnIdTokenFromTheIdpFails = ({ times }: { times: number }): void => {
    requestToGetAnIdTokenFromTheIdp()
      .times(times)
      .reply(403, '<!doctype html><html><body><div>Access to the requested resource has been forbidden.</div></body></html>');
  };

  const givenAuthenticationWithTheIdpSucceeds = (): void => givenAuthenticationWithTheIdpSucceedsWith({ sessionId, idToken });

  return {
    idToken,
    givenAuthenticationWithTheIdpSucceeds,
  };
};

const requestToCreateASessionWithTheIdp = (): nock.Interceptor =>
  nock(ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_BASE_URL)
    .post('/sessions', {
      loginName: ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_LOGIN_NAME,
      password: ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_PASSWORD,
    })
    .matchHeader('content-type', 'application/json')
    .matchHeader(ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_API_KEY_HEADER_NAME, ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_API_KEY);

const givenCreatingASessionWithTheIdpSucceedsWith = ({ sessionId, times }: { sessionId: string; times: number }): void => {
  requestToCreateASessionWithTheIdp()
    .times(times)
    .reply(201, '', { 'set-cookie': `${ACBS.AUTHENTICATION.SESSION_ID_COOKIE_NAME}=${sessionId}` });
};

const requestToGetAnIdTokenFromTheIdpFor = ({ sessionId }: { sessionId: string }): nock.Interceptor =>
  nock(ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_BASE_URL)
    .get(`/idptoken/openid-connect?client_id=${ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_CLIENT_ID}`)
    .matchHeader('content-type', 'application/x-www-form-urlencoded')
    .matchHeader(ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_API_KEY_HEADER_NAME, ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_API_KEY)
    .matchHeader('cookie', `${ACBS.AUTHENTICATION.SESSION_ID_COOKIE_NAME}=${sessionId}`);

const givenGettingAnIdTokenFromTheIdpSucceedsWith = ({ idToken, forSessionId }: { idToken: string; forSessionId: string }): void => {
  requestToGetAnIdTokenFromTheIdpFor({ sessionId: forSessionId }).reply(200, { id_token: idToken });
};

export const givenAuthenticationWithTheIdpSucceedsWith = ({ sessionId, idToken }: { sessionId: string; idToken: string }): void => {
  givenCreatingASessionWithTheIdpSucceedsWith({ sessionId, times: 1 });
  givenGettingAnIdTokenFromTheIdpSucceedsWith({ idToken, forSessionId: sessionId });
};
