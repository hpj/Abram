import { AsyncStorage } from 'react-native';

import * as Localization from 'expo-localization';

import axios from 'axios';

import i18n, { getDefault, fetch, locales, locale, setLocale } from '../src/i18n.js';

jest.mock('axios');

afterEach(() =>
{
  // delete any data that was fetched
  locales.forEach((locale) =>
  {
    delete locale.json;
  });
});

describe('Testing i18n', () =>
{
  test('Getting Default', () =>
  {
    const locale = getDefault();

    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.json).toBeUndefined();
  });

  test('Getting Default (Mocked)', () =>
  {
    // mock expo's response for the device's locale
    Localization.locale = 'en-US';

    const locale = getDefault();

    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.json).toBeUndefined();
  });

  test('Fetching Data', async() =>
  {
    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.json).toBeUndefined();
    
    // mock axios response
    axios.get
      .mockImplementationOnce(() => Promise.resolve({ data: { test: true } }));

    // fetch locale data
    await fetch('en-US');

    expect(locale.json).toContainAllKeys([
      'test'
    ]);

    expect(i18n('test')).toBeTrue();
  });

  test('Fetching Data (Error)', async() =>
  {
    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.json).toBeUndefined();
    
    // mock axios response
    axios.get
      .mockImplementationOnce(() =>
      {
        throw new Error();
      });

    // fetch locale data
    await fetch('en-US');

    expect(locale.json).toContainAllKeys([
      'offline'
    ]);

    expect(i18n('offline')).toBeString();
  });

  test('Fetching Data (Cache)', async() =>
  {
    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.json).toBeUndefined();

    // mock react native response
    AsyncStorage.getItem = (data, cb) => cb(undefined, JSON.stringify({ cache: true }));

    // mock axios response
    axios.get
      .mockImplementationOnce(() =>
      {
        throw new Error();
      });

    // fetch locale data
    await fetch('en-US');

    expect(locale.json).toContainAllKeys([
      'cache'
    ]);

    expect(i18n('cache')).toBeTrue();
  });

  test('Completing A Value', async() =>
  {
    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.json).toBeUndefined();
    
    // mock axios response
    const response = { data: { test: 'test-%0' } };

    axios.get.mockImplementationOnce(() => Promise.resolve(response));

    // fetch locale data
    await fetch('en-US');

    expect(locale.json).toContainAllKeys([
      'test'
    ]);

    expect(i18n('test', 'i18n')).toBe('test-i18n');
  });

  test('Changing The Locale', () =>
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