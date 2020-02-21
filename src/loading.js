import { fetch, locale } from './i18n.js';

export function load(callback)
{
  Promise.all([
    fetch(locale.id)
  ])
  // setTimeout is a workaround the fact that
  // Expo~RN ignores all errors thrown from Promises
    .then(() => callback())
    .catch((e) => setTimeout(() => callback(e || true)));
}