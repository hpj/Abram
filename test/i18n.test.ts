import * as Localization from 'expo-localization';

import i18n, { getDefault, setLocale, locale, locales } from '../src/i18n';

// mock en-US data
locales[0].data = {
  'test-a': 'test-%0',
  'test-b': 'tests~test'
};

describe('Testing i18n', () =>
{
  test('Getting Default', () =>
  {
    const locale = getDefault();

    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.data).toBeObject();
  });

  test('Getting Default (Mocked)', () =>
  {
    // mock expo's response for the device's locale
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    Localization.locale = 'en-US';

    const locale = getDefault();

    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.data).toBeObject();
  });

  test('Changing The Locale', () =>
  {
    // setting locale to an existing id
    expect(setLocale('en-US')).toBeTrue();

    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
  });

  test('Changing The Locale (Non-existent)', () =>
  {
    // setting locale to a non-existing id
    expect(setLocale('any-ZZ')).toBeFalse();
  });

  test('Getting A Value', async() =>
  {
    setLocale(locales[0].id);

    expect(i18n('test-a', 'i18n')).toBe('test-i18n');

    expect(i18n('test-b', '1')).toBe('1 test');

    expect(i18n('test-b', '2')).toBe('2 tests');
    expect(i18n('test-b', '10')).toBe('10 tests');
  });
});