import * as Localization from 'expo-localization';

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
    locale.json  = await request();
  }
  catch
  {
    locale.json = { 'offline': 'You need access to the internet to use Abram.' };
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