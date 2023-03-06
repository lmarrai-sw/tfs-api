import { AcbsService } from '@ukef/modules/acbs/acbs.service';
import { PartyExternalRatingGenerator } from '@ukef-test/support/generator/party-external-rating-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AcbsAuthenticationService } from '../acbs/acbs-authentication.service';
import { AcbsPartyExternalRatingsProvider } from './acbs-party-external-ratings.provider';

jest.mock('@ukef/modules/acbs/acbs.service');
jest.mock('@ukef/modules/acbs/acbs-authentication.service');

describe('AcbsPartyExternalRatingsProvider', () => {
  const valueGenerator = new RandomValueGenerator();
  const authToken = valueGenerator.string();

  let acbsAuthenticationService: AcbsAuthenticationService;
  let acbsService: AcbsService;
  let provider: AcbsPartyExternalRatingsProvider;

  beforeEach(() => {
    acbsAuthenticationService = new AcbsAuthenticationService(null, null, null);
    acbsService = new AcbsService(null, null);
    provider = new AcbsPartyExternalRatingsProvider(acbsAuthenticationService, acbsService);

    // eslint-disable-next-line jest/unbound-method
    when(acbsAuthenticationService.getIdToken).calledWith().mockResolvedValueOnce(authToken);
  });

  describe('getExternalRatingsForParty', () => {
    const partyIdentifier = '001';

    it('returns a transformation of the external ratings from ACBS', async () => {
      const { externalRatingsInAcbs, externalRatings: expectedExternalRatings } = new PartyExternalRatingGenerator(valueGenerator).generate({
        partyIdentifier,
        numberToGenerate: 2,
      });
      // eslint-disable-next-line jest/unbound-method
      when(acbsService.getExternalRatingsForParty).calledWith(partyIdentifier, authToken).mockResolvedValueOnce(externalRatingsInAcbs);

      const externalRatings = await provider.getExternalRatingsForParty(partyIdentifier);

      expect(externalRatings).toStrictEqual(expectedExternalRatings);
    });

    it('returns an empty array if ACBS returns an empty array', async () => {
      // eslint-disable-next-line jest/unbound-method
      when(acbsService.getExternalRatingsForParty).calledWith(partyIdentifier, authToken).mockResolvedValueOnce([]);

      const externalRatings = await provider.getExternalRatingsForParty(partyIdentifier);

      expect(externalRatings).toStrictEqual([]);
    });
  });
});
