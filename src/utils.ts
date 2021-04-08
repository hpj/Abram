import { format, differenceInDays, isToday, isYesterday } from 'date-fns';

import { Profile, ProfileInfo } from './types';

export function relativeDate(date?: Date, full?: boolean): string
{
  const baseDate = new Date();
  
  // istanbul ignore next
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

export function sharedInterests(...profiles: Profile[]): { shared: string[], mismatched: string[] }
{
  const shared: string[] = [];
  const mismatched: string[] = [];

  const interests = profiles.map(p => p.interests);

  if (profiles.length === 2)
  {
    const [ a, b ] = interests;

    b.forEach((value) =>
    {
      if (a.includes(value))
        shared.push(value);
      else
        mismatched.push(value);
    });
  }
  else
  {
    shared.push(...interests.reduce((a, b) => a.filter(c => b.includes(c))));
  }

  return {
    shared,
    mismatched
  };
}

export function getAge(birthday: Profile['info']['birthday']): number
{
  if (!birthday)
    return -1;

  const today = new Date();

  const todayYear = today.getFullYear(),
    todayMonth = today.getMonth(),
    todayDay = today.getDate();

  let age = todayYear - birthday.year;

  if (todayMonth < birthday.day - 1)
    age -= 1;
  
  if (birthday.month - 1 === todayMonth && todayDay < birthday.day)
    age -= 1;

  return age;
}

export function getName(profile: Profile): string
{
  return profile.nickname || profile.fullName;
}

export function incompleteProfile(profile: Profile): string[]
{
  const list = [];

  if (!profile.fullName?.length)
    list.push('name');

  if (!profile.info.gender)
    list.push('gender');
  
  // min languages is 1
  if (profile.info.speaks?.length < 1)
    list.push('speaks');
  
  // min interests is 3
  if (profile.interests?.length < 3)
    list.push('interests');

  return list;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function pronoun(gender: ProfileInfo['gender']): {
  they: string,
  them: string,
  their: string,
  theirs: string,
  themselves: string,
  are: string
}
{
  if (gender === 'Woman')
    return {
      they: 'she',
      them: 'her',
      themselves: 'herself',
      their: 'her',
      theirs: 'hers',
      are: 'is'
    };
  
  else if (gender === 'Man')
    return {
      they: 'he',
      them: 'him',
      their: 'his',
      theirs: 'his',
      themselves: 'himself',
      are: 'is'
    };
  
  else
    return {
      they: 'they',
      them: 'them',
      their: 'their',
      theirs: 'theirs',
      themselves: 'themselves',
      are: 'are'
    };
}