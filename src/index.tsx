import React from 'react';

import { Dimensions } from 'react-native';

import { registerRootComponent } from 'expo';

import constants from 'expo-constants';

import { activateKeepAwake } from 'expo-keep-awake';

import * as Sentry from 'sentry-expo';

import { Profile, InboxEntry, Size } from './types';

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
    width: 0,
    height: 0
  } as Size,

  // input values
  inputs: {},

  profile: {
    uuid: '0001',
    avatar: require('../assets/mockup/karkar-0.jpg'),
    // avatar: `${env.API_ENDPOINT}/avatar`,

    bio: 'The self-proclaimed Greatest Mastermind on Earth.',
    
    fullName: 'Kerolos Zaki',
    nickname: 'Kay',

    info: {
      speaks: [ 'English', 'Arabic' ],
      romantically: 'Open',
      gender: 'Man',
      worksAt: 'Herp Project'
    },
    
    interests: [
      'Visual Novels', 'Anime', 'Books', 'Cooking', 'Romance', 'Storytelling',
      'Acting', 'Directing', 'Reading', 'Design', 'Technology', 'Walking',
      'Psychology', 'Video Games'
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
          fullName: 'Kerolos Zaki',
          avatar: require('../assets/mockup/karkar-0.jpg')
        },
        {
          uuid: '0002',
          avatar: require('../assets/mockup/dina-0.jpg'),

          bio: 'Yet, there is something bold and innocent.',

          fullName: 'Dina El-Wedidi',
          nickname: 'Dina',

          info: {
            origin: 'Egypt',
            speaks: [ 'Arabic' ],
            profession: 'Singer',
            romantically: 'Open',
            gender: 'Woman',
            religion: 'Muslim',
            age: 33
          },

          iceBreakers: [
            'Do you like the spotlight?',
            'How much do you hate Kerolos?'
          ],

          interests: [
            'Music', 'Books', 'Cooking', 'Blacksmithing', 'Travailing', 'Bath Rooms',
            'Boxing', 'Mountain Climbing', 'Acting', 'Sculpting', 'Tennis', 'Woodworking', 'Cars', 'Driving',
            'Singing', 'Movies', 'Moving Making', 'Directing', 'Sculpting', 'Drawing'
          ]
        }
      ],
      messages: []
    },
    {
      id: 'C-0002',
      createdAt: subDays(new Date(), 24),
      updatedAt: subHours(new Date(), 26),
      displayName: 'Council of Karkars',
      members: [
        {
          uuid: '0001',
          avatar: require('../assets/mockup/karkar-0.jpg'),
          fullName: 'Kerolos Zaki'
        },
        {
          uuid: '0010',
          avatar: require('../assets/mockup/karkar-1.jpg'),
          fullName: 'Kerolos Zaki',
          nickname: 'Karkar',
          info: {
            speaks: [ 'English', 'Arabic' ],
            romantically: 'Open',
            gender: 'Man'
          },
          interests: [
            'Psychology', 'Mountain Biking', 'Kite Flying'
          ]
        },
        {
          uuid: '0011',
          avatar: require('../assets/mockup/karkar-3.jpg'),
          fullName: 'Kerolos Zaki',
          nickname: 'Karkar',
          info: {
            speaks: [ 'English', 'Arabic' ],
            romantically: 'Open',
            gender: 'Man'
          },
          interests: [
            'Psychology', 'Wine Tasting', 'Model Trains'
          ]
        },
        {
          uuid: '0012',
          avatar: require('../assets/mockup/karkar-4.jpg'),
          fullName: 'Kerolos Zaki',
          nickname: 'Karkar',
          info: {
            speaks: [ 'English', 'Arabic' ],
            romantically: 'Open',
            gender: 'Man'
          },
          interests: [
            'Psychology', 'Mountain Biking', 'Jigsaw Puzzles'
          ]
        },
        {
          uuid: '0013',
          avatar: require('../assets/mockup/karkar-5.jpg'),
          fullName: 'Kerolos Zaki',
          nickname: 'Karkar',
          info: {
            speaks: [ 'English', 'Arabic' ],
            romantically: 'Open',
            gender: 'Man'
          },
          interests: [
            'Psychology', 'Tombstone Rubbing', 'Squash'
          ]
        }
      ],
      messages: [
        { owner: '0011', text: 'Ahmed is an idiot.', createdAt: subDays(new Date(), 22) },
        { owner: '0001', text: 'I agree.', createdAt: addMinutes(subDays(new Date(), 21), 6) },
        { owner: '0013', text: 'Maybe, we could hug him.', createdAt: subHours(new Date(), 26) }
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
          fullName: 'Kerolos Zaki',
          avatar: require('../assets/mockup/karkar-0.jpg')
        },
        {
          uuid: '0100',
          avatar: require('../assets/mockup/amir-0.jpg'),
          
          bio: 'I am depressed because of Sharmoofers.',

          fullName: 'Amid Eid',
          nickname: 'Amir',

          info: {
            speaks: [ 'Arabic' ],
            romantically: 'Closed',
            gender: 'Man'
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
Dimensions.addEventListener('change', () => store.set({
  size: {
    width: 0,
    height: 0
  }
}));

registerRootComponent(() => <App/>);