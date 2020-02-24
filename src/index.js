import React from 'react';

import { Dimensions } from 'react-native';

import { registerRootComponent } from 'expo';

import Constants from 'expo-constants';

import { activateKeepAwake } from 'expo-keep-awake';

import constants from 'expo-constants';

import * as Sentry from 'sentry-expo';

import { createStore } from './store.js';

import App from './app.js';

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