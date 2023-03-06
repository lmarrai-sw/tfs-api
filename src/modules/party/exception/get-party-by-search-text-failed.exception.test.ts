import { RandomValueGenerator } from '@ukef-test/support/random-value-generator';

import { GetPartyBySearchTextFailedException } from './get-party-by-search-text-failed.exception';

describe('GetPartyBySearchTextFailedException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new GetPartyBySearchTextFailedException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new GetPartyBySearchTextFailedException(message);

    expect(exception.name).toBe('GetPartyBySearchTextFailedException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();
    const exception = new GetPartyBySearchTextFailedException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });
});
