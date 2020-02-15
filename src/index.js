import React from 'react';

import { registerRootComponent } from 'expo';
import { activateKeepAwake } from 'expo-keep-awake';

import App from './app.js';

// eslint-disable-next-line no-undef
if (__DEV__)
  activateKeepAwake();

registerRootComponent(() => <App/>);