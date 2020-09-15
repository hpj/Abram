import { format, differenceInDays, isToday, isYesterday } from 'date-fns';

export function relativeDate(date?: Date, full?: boolean): string
{
  const baseDate = new Date();
  
  if (!date)
    return '';
  else if (isToday(date))
    return format(date, '\'Today, \'hh:mm a');
  else if (isYesterday(date))
    return format(date, '\'Yesterday, \'hh:mm a');
  else if (differenceInDays(baseDate, date) <= 6)
    return format(date, 'EEEE\', \'hh:mm a');
  else if (full)
    return format(date, 'd MMMM yyyy, hh:mm a');
  else
    return format(date, 'd MMM yyyy');
}