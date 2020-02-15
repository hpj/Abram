/**
* @param { boolean } forceLight
*/
export default function()
{
  const dark = detectDeviceIsDark();

  const lightTheme = {
    theme: 'light',
    
    whiteText: '#ffffff',
    whiteBackground: '#ffffff',
   
    blackText: '#000000',
    blackBackground: '#000000',
   
    red: 'red',
    transparent: 'transparent'
  };

  const darkTheme = {
    ...lightTheme,

    theme: 'dark',

    whiteText: '#ffffff',
    whiteBackground: '#000000',

    blackBackground: '#101010',
    blackText: '#c3c3c3',

    red: '#9c0202'
  };

  return (dark) ? darkTheme : lightTheme;
}

export function detectDeviceIsDark()
{
  return true;

  // if (localStorage.getItem('forceDark') === 'true')
  //   return true;
  // else if (localStorage.getItem('forceDark') === 'false')
  //   return false;
  // else
  //   return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}