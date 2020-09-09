import AsyncStorage from '@react-native-community/async-storage';

import * as Localization from 'expo-localization';

import axios from 'axios';

import i18n, { getDefault, fetch, locales, locale, setLocale } from '../src/i18n';

// mock async-storage
jest.mock('@react-native-community/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn((err, cb) => cb())
}));

// mocks axios
const axiosMock = axios.get = jest.fn();

afterEach(() =>
{
  axiosMock.mockReset();

  // delete any data that was fetched
  locales.forEach((locale) => delete locale.json);
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
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
    axiosMock.mockResolvedValue({ data: { test: true } });

    // fetch locale data
    await fetch('en-US');
    
    expect(axios.get).toHaveBeenCalledTimes(1);

    expect(locale.json).toContainAllKeys([
      'test'
    ]);

    expect(i18n('test')).toBeTruthy();
  });

  test('Fetching Data (Error)', async() =>
  {
    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.json).toBeUndefined();
    
    // mock axios response
    axiosMock.mockImplementation(() =>
    {
      throw new Error();
    });

    // fetch locale data
    await fetch('en-US');

    expect(axios.get).toHaveBeenCalledTimes(1);

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
    AsyncStorage.getItem = jest.fn((data, cb) =>
    {
      const value = JSON.stringify({ cache: true });

      cb?.call(undefined, undefined, value);

      return Promise.resolve(value);
    });

    // mock axios response
    axiosMock.mockImplementation(() =>
    {
      throw new Error();
    });

    // fetch locale data
    await fetch('en-US');

    expect(axios.get).toHaveBeenCalledTimes(1);

    expect(locale.json).toContainAllKeys([
      'cache'
    ]);

    expect(i18n('cache')).toBeTruthy();
  });

  test('Completing A Value', async() =>
  {
    expect(locale.id).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    
    expect(locale.json).toBeUndefined();
    
    // mock axios response
    axiosMock.mockResolvedValue({ data: { test: 'test-%0' } });

    // fetch locale data
    await fetch('en-US');

    expect(axios.get).toHaveBeenCalledTimes(1);

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