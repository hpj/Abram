import React from 'react';

import { Dimensions } from 'react-native';

import { registerRootComponent } from 'expo';
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
  index: 0,
  size: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  }
});

// update state when size changes
Dimensions.addEventListener('change', ({ window }) => store.set({
  size: {
    width: window.width,
    height: window.height
  }
}));

registerRootComponent(() => <App/>);