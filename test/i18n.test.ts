import * as Localization from 'expo-localization';

import i18n, { getDefault, fetch, locales, locale, setLocale } from '../src/i18n';

afterEach(() =>
{
  // delete any data that was fetched
  locales.forEach((locale) => delete locale.json);
});

describe('Testing i18n', () =>
{
  test.skip('Getting Default', () =>
  {
    const locale = getDefault();

    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.json).toBeUndefined();
  });

  test.skip('Getting Default (Mocked)', () =>
  {
    // mock expo's response for the device's locale
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    Localization.locale = 'en-US';

    const locale = getDefault();

    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.json).toBeUndefined();
  });

  test.skip('Fetching Data', async() =>
  {
    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.json).toBeUndefined();
    
    // fetch locale data
    await fetch('en-US');
    
    expect(locale.json).toContainAllKeys([
      'test'
    ]);

    expect(i18n('test')).toBeTruthy();
  });

  test.skip(('Fetching Data (Error)', async() =>
  {
    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.json).toBeUndefined();
    
    // fetch locale data
    await fetch('en-US');

    expect(locale.json).toContainAllKeys([
      'offline'
    ]);

    expect(i18n('offline')).toBeString();
  });

  test.skip('Completing A Value', async() =>
  {
    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.json).toBeUndefined();
    
    // fetch locale data
    await fetch('en-US');

    expect(locale.json).toContainAllKeys([
      'test'
    ]);

    expect(i18n('test', 'i18n')).toBe('test-i18n');
  });

  test.skip('Changing The Locale', () =>
  {
    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');

    // setting locale to non-existing id
    setLocale('any-ZZ');

    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    // setting locale to an existing id
    setLocale('ar-EG');

    expect(locale.id).toBe('ar-EG');
    expect(locale.direction).toBe('rtl');
  });
});