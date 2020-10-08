import React from 'react';

import { Dimensions, Keyboard } from 'react-native';

import { registerRootComponent } from 'expo';

import constants from 'expo-constants';

import { activateKeepAwake } from 'expo-keep-awake';

import * as Sentry from 'sentry-expo';

import { Profile, InboxEntry, Keyboard as TKeyboard, Size } from './types';

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
  // default view
  title: 'Inbox',
  index: 0,
  
  // used to control the pointer events of the app holder view
  holder: false,

  size: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height - constants.statusBarHeight
  } as Size,

  keyboard: {
    height: 0
  } as TKeyboard,

  profile: {
    uuid: '0001',
    avatar: require('../assets/mockup/karkar-0.jpg'),
    // avatar: `${env.API_ENDPOINT}/avatar`,

    bio: 'The self-proclaimed world\'s greatest Mastermind.',
    displayName: 'Kerolos Zaki',
    nickname: 'Kay',

    info: {
      romantically: 'Open'
    },
    
    interests: [
      'Visual Novels', 'Anime', 'Books', 'Cooking', 'Romance', 'Storytelling',
      'Acting', 'Directing', 'Reading', 'Design', 'Technology', 'Walking',
      'Video Games'
    ]
  } as Profile,

  activeChat: undefined,

  inbox: [
    {
      id: 'C-0001',
      createdAt: subDays(new Date(), 22),
      updatedAt: subHours(new Date(), 1),
      displayName: 'Dina El-Wedidi',
      members: [
        {
          uuid: '0001',
          displayName: 'Kerolos Zaki',
          avatar: require('../assets/mockup/karkar-0.jpg')
        },
        {
          uuid: '0002',
          avatar: require('../assets/mockup/dina-0.jpg'),

          bio: 'I love screaming and I hate this app.',
          displayName: 'Dina El-Wedidi',
          nickname: 'Dina',

          info: {
            origin: 'Egypt',
            speaks: [ 'English', 'Arabic' ],
            profession: 'Singer',
            romantically: 'Closed',
            gender: 'Woman',
            sexuality: 'Straight',
            religion: 'Muslim',
            age: 33
          },

          iceBreakers: [
            'Do you like the spotlight?',
            'How much do you hate Kerolos?'
          ],

          interests: [
            'Visual Novels', 'Music', 'Books', 'Cooking', 'Blacksmithing', 'Travailing', 'Bath Rooms',
            'Boxing', 'Mountain Climbing', 'Acting', 'Sculpting', 'Tennis', 'Woodworking', 'Cars', 'Driving',
            'Singing', 'Movies', 'Moving Making', 'Directing', 'Sculpting', 'Drawing'
          ]
        }
      ],
      messages: [
        // { owner: '0002', text: 'Did you really made it through the world’s championship of shit?', createdAt: subDays(new Date(), 21) },
        // { owner: '0001', text: 'No.', createdAt: addMinutes(subDays(new Date(), 21), 3) },
        // { owner: '0002', text: 'Hey Kay, We need to talk about your face.', createdAt: subHours(new Date(), 1) }
      ]
    },
    {
      id: 'C-0002',
      createdAt: subDays(new Date(), 24),
      updatedAt: subHours(new Date(), 26),
      displayName: 'Councill of Karkars',
      members: [
        {
          uuid: '0001',
          avatar: require('../assets/mockup/karkar-0.jpg'),
          displayName: 'Kerolos Zaki'
        },
        {
          uuid: '0010',
          avatar: require('../assets/mockup/karkar-1.jpg'),
          displayName: 'Kerolos Zaki',
          nickname: 'Karkar',
          info: {
            romantically: 'Open'
          },
          interests: [
            'Meditation', 'Mountain Biking', 'Kite Flying'
          ]
        },
        {
          uuid: '0011',
          avatar: require('../assets/mockup/karkar-3.jpg'),
          displayName: 'Kerolos Zaki',
          nickname: 'Karkar',
          info: {
            romantically: 'Open'
          },
          interests: [
            'Knitting', 'Wine Tasting', 'Model Trains'
          ]
        },
        {
          uuid: '0012',
          avatar: require('../assets/mockup/karkar-4.jpg'),
          displayName: 'Kerolos Zaki',
          nickname: 'Karkar',
          info: {
            romantically: 'Open'
          },
          interests: [
            'Croquet', 'Mountain Biking', 'Jigsaw Puzzles'
          ]
        },
        {
          uuid: '0013',
          avatar: require('../assets/mockup/karkar-5.jpg'),
          displayName: 'Kerolos Zaki',
          nickname: 'Karkar',
          info: {
            romantically: 'Open'
          },
          interests: [
            'Home brewing', 'Tombstone rubbing', 'Squash'
          ]
        }
      ],
      messages: [
        { owner: '0011', text: 'Ahmed is an idiot.', createdAt: subDays(new Date(), 22) },
        { owner: '0001', text: 'I agree.', createdAt: addMinutes(subDays(new Date(), 21), 6) },
        { owner: '0013', text: 'Maybe, we could kill him.', createdAt: subHours(new Date(), 26) }
      ]
    },
    {
      id: 'C-0003',
      createdAt: subDays(new Date(), 50),
      updatedAt: subDays(new Date(), 50),
      displayName: 'Amir Eid',
      members: [
        {
          uuid: '0001',
          displayName: 'Kerolos Zaki',
          avatar: require('../assets/mockup/karkar-0.jpg')
        },
        {
          uuid: '0100',
          avatar: require('../assets/mockup/amir-0.jpg'),
          
          bio: 'I am depressed because of Sharmoofers.',
          displayName: 'Amid Eid',
          nickname: 'Amir',

          info: {
            romantically: 'Closed'
          },

          interests: [
            'Grave Robbing', 'First Edition Book Collecting', 'Table Tennis'
          ]
        }
      ],
      messages: [
        { owner: '0100', text: 'Sharmoofers bad.', createdAt: subDays(new Date(), 50) }
      ]
    }
  ] as InboxEntry[]
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