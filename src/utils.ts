import { format, differenceInDays, isToday, isYesterday } from 'date-fns';

import { Profile, ProfileInfo } from './types';

export function relativeDate(date?: Date, full?: boolean): string
{
  const baseDate = new Date();
  
  if (!date)
    return '';

  // today
  
  else if (isToday(date) && full)
    return format(date, '\'Today, \'hh:mm a');
  else if (isToday(date))
    return format(date, 'hh:mm a');


  // yesterday

  else if (isYesterday(date) && full)
    return format(date, '\'Yesterday, \'hh:mm a');
  else if (isYesterday(date))
    return 'Yesterday';

  // this week

  else if (differenceInDays(baseDate, date) <= 6 && full)
    return format(date, 'EEEE\', \'hh:mm a');
  else if (differenceInDays(baseDate, date) <= 6)
    return format(date, 'EEEE');

  // longer than a week

  else if (full)
    return format(date, 'd MMMM yyyy, hh:mm a');
  else
    return format(date, 'd MMM yyyy');
}

export function sharedInterests(user: Profile, profile: Profile): { shared: string[], mismatched: string[] }
{
  const shared: string[] = [];
  const mismatched: string[] = [];

  profile.interests.forEach((value) =>
  {
    if (user.interests.includes(value))
      shared.push(value);
    else
      mismatched.push(value);
  });

  profile.interests.filter(value => user.interests.includes(value));

  return {
    shared,
    mismatched
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function pronoun(gender: ProfileInfo['gender']): {
  they: string,
  them: string,
  their: string,
  theirs: string
}
{
  if (gender === 'Woman')
    return {
      they: 'she',
      them: 'her',
      their: 'her',
      theirs: 'hers'
    };
  
  else if (gender === 'Man')
    return {
      they: 'he',
      them: 'him',
      their: 'his',
      theirs: 'his'
    };
  
  else
    return {
      they: 'they',
      them: 'them',
      their: 'their',
      theirs: 'theirs'
    };
}