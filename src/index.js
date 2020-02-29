import React from 'react';

import { Dimensions, Keyboard } from 'react-native';

import { registerRootComponent } from 'expo';

import constants from 'expo-constants';

import { activateKeepAwake } from 'expo-keep-awake';

import * as Sentry from 'sentry-expo';

import { createStore } from './store.js';

import App from './app.js';

import { subDays, addMinutes, subHours } from 'date-fns';

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
const store = createStore('app', {
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
    displayName: 'Kerolos Zaki',
    username: 'ker0olos',
    avatar: require('../assets/mockup/ker0olos.jpeg')
  },

  activeChat: {},

  inbox: [
    {
      displayName: 'Dina El-Wedidi',
      members: [
        'ker0olos',
        'ElwedidiDina'
      ],
      avatars: {
        'ElwedidiDina': require('../assets/mockup/dina-0.jpg')
      },
      messages: [
        // timestamp
        { owner: 'ElwedidiDina', text: 'Did you really made it through the world’s championship of shit?', timestamp: subDays(new Date(), 21) },
        { owner: 'ker0olos', text: 'No.', timestamp: addMinutes(subDays(new Date(), 21), 3) },
        // timestamp
        { owner: 'ElwedidiDina', text: 'Hey Kay, We need to talk about your face.', timestamp: subHours(new Date(), 1) }
      ]
    },
    {
      displayName: 'Councill of Karkars',
      members: [
        'ker0olos',
        'karkar-1',
        'karkar-3',
        'karkar-4',
        'karkar-5'
      ],
      avatars: {
        'karkar-1': require('../assets/mockup/karkar-1.jpg'),
        'karkar-3': require('../assets/mockup/karkar-3.jpg'),
        'karkar-4': require('../assets/mockup/karkar-4.png'),
        'karkar-5': require('../assets/mockup/karkar-5.jpg')
      },
      messages: [
        { owner: 'karkar-1', text: 'Ahmed is an idiot.', timestamp: subDays(new Date(), 21) },
        { owner: 'ker0olos', text: 'I agree.', timestamp: addMinutes(subDays(new Date(), 21), 6) },
        { owner: 'karkar-3', text: 'Maybe, we could kill him.', timestamp: subHours(new Date(), 26) }
      ]
    },
    {
      displayName: 'Al-Sisi',
      members: [
        'ker0olos',
        'Bal7a'
      ],
      avatars: {
        'Bal7a': require('../assets/mockup/sisi-0.jpg')
      },
      messages: [
        { owner: 'Bal7a', text: 'Dude, I fucked up.', timestamp: subDays(new Date(), 50) }
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