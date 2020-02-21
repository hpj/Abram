import * as Localization from 'expo-localization';

import { AsyncStorage } from 'react-native';

import axios from 'axios';

export const locales = [
  { label: 'English (United States)', id: 'en-US', direction: 'ltr' },
  { label: 'عربي (مصر)', id: 'ar-EG', direction: 'rtl' }
];

/**
* @type { { label: string, id: string, direction: string, json: {} } }
*/
export let locale = getDefault();

export function getDefault()
{
  // TODO save and load user's preference

  const deviceLocaleId = Localization.locale;

  const find = locales.find((e) => e.id === deviceLocaleId);

  if (find)
    return find;
  else
    return locales[0];
}

export function fetch(localeId)
{
  return new Promise((resolve) =>
  {
    const key = `i18n@${localeId}`;

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
  
    request()
      .then((data) =>
      {
        locale.json = data;

        // cache a version of the locale (in case it's needed)
        AsyncStorage.setItem(key, JSON.stringify(data));

        resolve();
      })
      .catch(() =>
      {
        // failed to request a new version of the locale data
        // fetch a cached version if possible
        AsyncStorage.getItem(key, (err, data) =>
        {
          // no cached version of the locale was found
          // the app can't be rendered
          if (err || !data)
            data = { 'offline': 'Looks like you don\'t have access to the internet.' };
          else
            data = JSON.parse(data);
      
          locale.json = data;

          resolve();
        });
      });
  });
}

/**
* @param { string } country
*/
export function setLocale(id)
{
  // TODO show the new translations after it was selected

  if (locale)
  {
    const find = locales.find((e) => e.id === id);

    if (find)
      locale = find;
    
    return locale;
  }
}

/**
* @param { string } key
* @param { string[] } args
* @returns { string }
*/
export default function i18n(key, ...args)
{
  if (locale && locale.json)
  {
    /**
    * @type { string }
    */
    // eslint-disable-next-line security/detect-object-injection
    let value = locale.json[key];

    args.forEach((s, i) => value = value.replace(`%${i}`, s));

    return value;
  }
}