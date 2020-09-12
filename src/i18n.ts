import * as Localization from 'expo-localization';

import AsyncStorage from '@react-native-community/async-storage';

import axios from 'axios';

export const locales: Locale[] = [
  { label: 'English (United States)', id: 'en-US', direction: 'ltr' }
];

type Locale = { label: string, id: string, direction: string, json?: Record<string, string> }

export let locale: Locale = getDefault();

export function getDefault(): Locale
{
  // TODO save and load user's preference

  const deviceLocaleId = Localization.locale;

  const find = locales.find((e) => e.id === deviceLocaleId);

  return find ? find : locales[0];
}

export async function fetch(localeId: string): Promise<void>
{
  const key = 'i18n-data';

  const request = async() =>
  {
    const projectID = 547;

    // https://api.crowdl.io/projects/547
    // https://api.crowdl.io/547/languages
    // https://api.crowdl.io/547/translationCounts
  
    const json = await axios.get(`https://api.crowdl.io/${projectID}/${localeId}.json`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  
    return json.data;
  };

  try
  {
    const data = locale.json  = await request();
  
    // cache a version of the locale (in case it's needed)
    AsyncStorage.setItem(key, JSON.stringify(data));
  }
  catch
  {
    // failed to request a new version of the locale data
    // fetch a cached version if possible
    const data = await AsyncStorage.getItem(key);

    // no cached version of the locale was found
    // the app can't be rendered
    if (!data)
      locale.json = { 'offline': 'Looks like you don\'t have access to the internet.' };
    else
      locale.json = JSON.parse(data);
  }
}

export function setLocale(id: string): Locale
{
  // TODO show the new translations after it was selected

  const find = locales.find((e) => e.id === id);

  if (find)
    locale = find;
  
  return locale;
}

/**
*/
export default function i18n(key: string, ...args: string[]): string
{
  // eslint-disable-next-line security/detect-object-injection
  let value = locale.json?.[key];

  args.forEach((s, i) => value = value?.replace(`%${i}`, s));

  return value ?? '';
}