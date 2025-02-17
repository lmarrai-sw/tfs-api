import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { CreatePartyInAcbsFailedException } from './create-party-in-acbs-failed.exception';
import { PartyException } from './party-exception';

describe('CreatePartyInAcbsFailedException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new CreatePartyInAcbsFailedException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new CreatePartyInAcbsFailedException(message);

    expect(exception.name).toBe('CreatePartyInAcbsFailedException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();
    const exception = new CreatePartyInAcbsFailedException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of PartyException', () => {
    expect(new CreatePartyInAcbsFailedException(message)).toBeInstanceOf(PartyException);
  });
});
