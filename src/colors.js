import parse from 'color-parse';

export default function()
{
  const dark = detectDeviceIsDark();

  const darkTheme = {
    theme: 'dark',

    whiteText: '#ffffff',
    whiteBackground: '#000000',

    inactiveWhiteText: alpha('#ffffff', '0.6'),

    blackBackground: '#101010',
    blackText: '#c3c3c3',

    ripple: alpha('#ffffff', '0.15'),

    bottomNavigationBackground: '#4B4B4B',
    bottomNavigationBackgroundInactive: alpha('#4B4B4B', '0.3'),

    red: '#9c0202',
    transparent: 'transparent'
  };

  const lightTheme = {
    ...darkTheme,

    theme: 'light',
    
    whiteText: '#ffffff',
    whiteBackground: '#ffffff',
   
    blackText: '#000000',
    blackBackground: '#000000',
   
    red: 'red'
  };

  return (dark) ? darkTheme : lightTheme;
}

function alpha(color, value)
{
  const obj = parse(color);

  if (value == null) value = obj.alpha;

  // catch percent
  if (obj.space[0] === 'h')
    return obj.space + [ 'a(', obj.values[0], ',', obj.values[1], '%,', obj.values[2], '%,', value, ')' ].join('');

  return obj.space + [ 'a(', obj.values, ',', value, ')' ].join('');
}

export function detectDeviceIsDark()
{
  // if (localStorage.getItem('forceDark') === 'true')
  //   return true;
  // else if (localStorage.getItem('forceDark') === 'false')
  //   return false;
  // else
  //   return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return true;
}