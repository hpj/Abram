import { fetch, locale } from './i18n';

export function load(callback: (err?: string) => void): void
{
  Promise.all([
    fetch(locale.id)
  ])
    .then(() => callback())
    .catch((e) => callback(e || true));
}