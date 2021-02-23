
import * as Localization from 'expo-localization';

export const locales: Locale[] = [
  {
    id: 'en-US',
    label: 'English (United States)',
    language: 'en',
    direction: 'ltr',
    data: require('../i18n/en-US.json')
  }
];

type Locale = { id: string, label: string, language: string, direction: string, data: Record<string, string> }

/** exported so it can be tested in tests/i18n.test.ts
*/
export let locale: Locale;

/** exported so it can be tested in tests/i18n.test.ts
*/
export function getDefault(): Locale
{
  // TODO save and load user's preference

  const deviceLocaleId = Localization.locale;

  const find = locales.find((e) => e.id === deviceLocaleId);

  return find ? find : locales[0];
}

export function setLocale(id?: string): boolean
{
  // TODO show the new translations after it was selected

  const find = id ? locales.find((e) => e.id === id) : getDefault();

  if (!find)
    return false;
  
  locale = find;

  return true;
}

/**
*/
export default function i18n(key: string, ...args: (string)[]): string
{
  // eslint-disable-next-line security/detect-object-injection
  let value = locale.data[key];

  // handle plurals
  if (value?.includes('~'))
  {
    const split = value.split('~');

    if (parseInt(args[0]) <= 1)
      return `${args[0]} ${split[1]}`;
    
    return `${args[0]} ${split[0]}`;
  }
  // replace with args
  else
  {
    args.forEach((s, i) => value = value?.replace(`%${i}`, s));
  }

  return value ?? '';
}