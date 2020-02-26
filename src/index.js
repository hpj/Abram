import React from 'react';

import { Dimensions } from 'react-native';

import { registerRootComponent } from 'expo';

import Constants from 'expo-constants';

import { activateKeepAwake } from 'expo-keep-awake';

import constants from 'expo-constants';

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

  profile: {
    displayName: 'Kerolos Zaki',
    username: 'ker0olos',
    avatar: require('../assets/mockup/ker0olos.jpeg')
  },

  inbox: [
    {
      displayName: 'Dina El-Wedidi',
      avatars: {
        'ElwedidiDina': require('../assets/mockup/dina-0.jpg')
      },
      messages: [
        { owner: 'ElwedidiDina', text: 'Did you really made it through the world’s championship of shit?', timestamp: subDays(new Date(), 21) },
        { owner: 'ker0olos', text: 'No', timestamp: addMinutes(subDays(new Date(), 21), 3) },
        { owner: 'ElwedidiDina', text: 'Hey Kay, We need to talk about your face.', timestamp: subHours(new Date(), 1) }
      ]
    },
    {
      displayName: 'Councill of Karkars',
      avatars: {
        'karkar-1': require('../assets/mockup/karkar-1.jpg'),
        'karkar-3': require('../assets/mockup/karkar-3.jpg'),
        'karkar-4': require('../assets/mockup/karkar-4.png'),
        'karkar-5': require('../assets/mockup/karkar-5.jpg')
      },
      messages: [
        { owner: 'karkar-1', text: 'Ahmed is an idiot.', timestamp: subDays(new Date(), 21) },
        { owner: 'ker0olos', text: 'I agree.', timestamp: addMinutes(subDays(new Date(), 21), 3) },
        { owner: 'karkar-4', text: 'Maybe, we could kill him.', timestamp: subHours(new Date(), 2) }
      ]
    },
    {
      displayName: 'Al-Sisi',
      avatars: {
        'Bal7a': require('../assets/mockup/sisi-0.jpg')
      },
      messages: [
        { owner: 'Bal7a', text: 'Did you really made it through the world’s championship of shit?', timestamp: subDays(new Date(), 4) }
      ]
    }
  ],

  size: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height - Constants.statusBarHeight
  }
});

// update state when size changes
Dimensions.addEventListener('change', ({ screen }) => store.set({
  size: {
    width: screen.width,
    height: screen.height - Constants.statusBarHeight
  }
}));

registerRootComponent(() => <App/>);