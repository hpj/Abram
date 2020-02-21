import i18n, { fetch, locale } from '../src/i18n.js';

describe('Testing i18n', () =>
{
  test('Testing Fetching', async() =>
  {
    // const a = await fetch()
    // expect(locale).toBeDefined();

    // expect(locale.locale).toBe('ar-EG');
    // expect(locale.direction).toBe('rtl');

    expect(i18n('t')).toBe('a');
  });
});