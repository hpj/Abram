// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function()
{
  // const dark = detectDeviceIsDark();

  const darkTheme = {
    theme: 'dark',

    transparent: '#FFFFFF00',

    whiteText: '#ffffff',
    whiteBackground: '#ffffff',
    
    inactiveWhiteText: alpha('#ffffff', 0.6),
    
    blackText: '#000000',
    blackBackground: '#000000',

    greyText: '#818181',

    placeholder: alpha('#ffffff', 0.45),
    ripple: alpha('#ffffff', 0.085),

    iconBackground: '#4B4B4B',
    iconBackgroundInactive: alpha('#4B4B4B', 0.3),

    menuBackground: '#414141',
    popupBackground: '#171717',

    messageBackground: '#1C1C1C',
    rectangleBackground: '#151515',
    
    // what is used for, looks unnecessary
    text: alpha('#ffffff', 0.8),

    green: '#2f9634',
    red: '#631515',
    brightRed: '#bf0404'
  };

  // const lightTheme = {
  //   ...darkTheme,
  // };

  // return dark ? darkTheme : lightTheme;

  return darkTheme;
}

function alpha(color: string, value: number)
{
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return `rgba(${r},${g},${b},${value})`;
}

// export function detectDeviceIsDark()
// {
//   // if (localStorage.getItem('forceDark') === 'true')
//   //   return true;
//   // else if (localStorage.getItem('forceDark') === 'false')
//   //   return false;
//   // else
//   //   return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
//   return true;
// }