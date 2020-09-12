import React from 'react';

import { Dimensions, Keyboard } from 'react-native';

import { registerRootComponent } from 'expo';

import constants from 'expo-constants';

import { activateKeepAwake } from 'expo-keep-awake';

import * as Sentry from 'sentry-expo';

import { createStore } from './store';

import App from './app';

import { subDays, addMinutes, subHours } from 'date-fns';

// const env = {
//   'API_ENDPOINT': (__DEV__) ?
//     `http://${constants.manifest.debuggerHost.split(':').shift()}:3000`:
//     'https://085wa6iwmd.execute-api.us-east-2.amazonaws.com'
// };

// error tracking

Sentry.init({
  release: constants.manifest.revisionId,
  dsn: 'https://cb0d0d5b96884ebebae0499b54a1cc9e@sentry.io/1886510',
  enableInExpoDevelopment: false
});

// eslint-disable-next-line no-undef
if (__DEV__)
  activateKeepAwake();

// create app-wide store
const store = createStore({
  // used to change the current view aka route
  index: 0,
  
  // used to control the pointer events of the app holder view
  holder: false,

  size: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height - constants.statusBarHeight
  },

  keyboard: {
    height: 0
  },

  profile: {
    uuid: '0001',
    displayName: 'Kerolos Zaki',
    username: 'ker0olos',
    avatar: require('../assets/mockup/ker0olos.jpeg')
    // avatar: `${env.API_ENDPOINT}/avatar`
  },

  activeChat: {},

  inbox: [
    {
      id: 'C-0001',
      displayName: 'Dina El-Wedidi',
      members: [
        {
          uuid: '0001',
          displayName: 'Kerolos Zaki',
          username: 'ker0olos',
          avatar: require('../assets/mockup/ker0olos.jpeg')
        },
        {
          uuid: '0002',
          displayName: 'Dina El-Wedidi',
          username: 'ElwedidiDina',
          avatar: require('../assets/mockup/dina-0.jpg')
        }
      ],
      messages: [
        { owner: '0002', text: 'Did you really made it through the world’s championship of shit?', timestamp: subDays(new Date(), 21) },
        { owner: '0001', text: 'No.', timestamp: addMinutes(subDays(new Date(), 21), 3) },
        { owner: '0002', text: 'Hey Kay, We need to talk about your face.', timestamp: subHours(new Date(), 1) }
      ]
    },
    {
      id: 'C-0002',
      displayName: 'Councill of Karkars',
      members: [
        {
          uuid: '0001',
          displayName: 'Kerolos Zaki',
          username: 'ker0olos',
          avatar: require('../assets/mockup/ker0olos.jpeg')
        },
        {
          uuid: '0010',
          displayName: 'Kerolos Zaki',
          username: 'karkar-1',
          avatar: require('../assets/mockup/karkar-1.jpg')
        },
        {
          uuid: '0011',
          displayName: 'Kerolos Zaki',
          username: 'karkar-3',
          avatar: require('../assets/mockup/karkar-3.jpg')
        },
        {
          uuid: '0012',
          displayName: 'Kerolos Zaki',
          username: 'karkar-4',
          avatar: require('../assets/mockup/karkar-4.jpg')
        },
        {
          uuid: '0013',
          displayName: 'Kerolos Zaki',
          username: 'karkar-5',
          avatar: require('../assets/mockup/karkar-5.jpg')
        }
      ],
      messages: [
        { owner: '0011', text: 'Ahmed is an idiot.', timestamp: subDays(new Date(), 21) },
        { owner: '0001', text: 'I agree.', timestamp: addMinutes(subDays(new Date(), 21), 6) },
        { owner: '0013', text: 'Maybe, we could kill him.', timestamp: subHours(new Date(), 26) }
      ]
    },
    {
      id: 'C-0003',
      displayName: 'Al-Sisi',
      members: [
        {
          uuid: '0001',
          displayName: 'Kerolos Zaki',
          username: 'ker0olos',
          avatar: require('../assets/mockup/ker0olos.jpeg')
        },
        {
          uuid: '0100',
          displayName: 'Al-Sisi',
          username: 'Bal7a',
          avatar: require('../assets/mockup/sisi-0.jpg')
        }
      ],
      messages: [
        { owner: '0100', text: 'Dude, I fucked up.', timestamp: subDays(new Date(), 50) }
      ]
    }
  ]
});

// update state when size changes
Dimensions.addEventListener('change', ({ screen }) => store.set({
  size: {
    width: screen.width,
    height: screen.height - constants.statusBarHeight
  }
}));

Keyboard.addListener('keyboardDidShow', (e) => store.set({
  keyboard: {
    height: e.endCoordinates.height
  }
}));

Keyboard.addListener('keyboardDidHide', () => store.set({
  keyboard: {
    height: 0
  }
}));

registerRootComponent(() => <App/>);