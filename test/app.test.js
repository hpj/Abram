/* eslint-disable security/detect-object-injection */
/* eslint-disable react/prop-types */

import React from 'react';

import { BackHandler } from 'react-native';

import axios from 'axios';

import { render, fireEvent, waitForElement, flushMicrotasksQueue, cleanup } from 'react-native-testing-library';

import { subDays } from 'date-fns';

import { advanceTo, clear } from 'jest-date-mock';

import { createStore, getStore, deleteStore } from '../src/store.js';

import { fetch } from '../src/i18n.js';

import App from '../src/app.js';

import Inbox from '../src/screens/Inbox.js';

/** splits react testing library json trees to parts to make it easier to review
* @param { import('react-native-testing-library').RenderAPI } renderer
* @param { string } testId
* @param { 'none' | 'one' | 'all' } [shallow] removes children from the returned object
*/
function toJSON(renderer, testId, shallow)
{
  function getByTestId(tree, testId)
  {
    if (!tree)
      return undefined;
      
    if (tree.props && tree.props['testID'] && tree.props['testID'] === testId)
      return tree;
  
    for (let i = 0; i < Object.keys(tree).length; i++)
    {
      if (typeof tree[Object.keys(tree)[i]] == 'object')
      {
        const o = getByTestId(tree[Object.keys(tree)[i]], testId);

        if (o !== undefined)
          return o;
      }
    }

    return undefined;
  }

  // default shallow is 'none'
  shallow = shallow || 'none';

  const tree = renderer.toJSON();

  let target;

  if (!testId)
    target = tree;
  else
    target = getByTestId(tree, testId);

  if (target && shallow === 'none')
    target.children = [];
  else if (target && shallow === 'one')
    target.children.forEach((c) => c.children = []);
  
  return target;
}

// mocks axios
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: { test: true } })
}));

// mock the back button handler module
jest.mock('react-native/Libraries/Utilities/BackHandler', () =>
  // eslint-disable-next-line jest/no-mocks-import
  require('react-native/Libraries/Utilities/__mocks__/BackHandler'));

// mock the flat list component
jest.mock('react-native/Libraries/Lists/FlatList', () =>
{
  const { Component, cloneElement } = require('react');
  const { View } = require('react-native');

  class FlatList extends Component
  {
    render()
    {
      return <View { ...this.props }>
        {
          this.props.data.map((item, index) =>
          {
            const key = this.props.keyExtractor(item, index);
            
            const element = this.props.renderItem({ item, index });
            
            return cloneElement(element, { key });
          })
        }
      </View>;
    }
  }

  return FlatList;
});

// mock react native bottom sheet
jest.mock('reanimated-bottom-sheet', () =>
{
  const { Component } = require('react');
  const { View } = require('react-native');

  class BottomSheet extends Component
  {
    constructor()
    {
      super();

      this.snapTo = this.snapTo.bind(this);
    }

    snapTo(index)
    {
      // execute callback
      if (index === 1)
      {
        if (this.props.onOpenStart)
          this.props.onOpenStart();
      }
      else if (index === 0)
      {
        if (this.props.onCloseEnd)
          this.props.onCloseEnd();
      }

      // update callbackNode value
      if (this.props.callbackNode)
        this.props.callbackNode.setValue(index);
      
      // force the view to update
      this.forceUpdate();
    }

    render()
    {
      const top = this.props.callbackNode.interpolate({
        inputRange: [ 0, 1 ],
        outputRange: this.props.snapPoints
      });

      return <View style={ { top: top } }>
        { this.props.renderHeader() }
        { this.props.renderContent() }
      </View>;
    }
  }

  return BottomSheet;
});

// mock react native reanimated
jest.mock('react-native-reanimated', () =>
{
  const { View } = require('react-native');

  return {
    createAnimatedComponent: jest.fn((c) => c),
    timing: jest.fn((value, { toValue }) =>
    {
      return {
        start: jest.fn((callback) =>
        {
          value.setValue(toValue);
  
          if (callback)
          {
            callback({ finished: false });

            callback({ finished: true });
          }
        })
      };
    }),
    View: View,
    Value: jest.fn().mockImplementation((value) =>
    {
      let v = value || 0;
  
      return {
        get: () => v,
        setValue: (value) => v = value,
        interpolate: ({ inputRange, outputRange }) => outputRange[inputRange.indexOf(v)]
      };
    }),
    Easing: jest.fn()
  };
});

// mock our i18n module
jest.mock('../src/i18n.js');

beforeEach(() =>
{
  advanceTo(new Date(2144, 0, 0));

  createStore('app', {
    index: 0,
    holder: false,

    size:
    {
      width: 523,
      height: 1131
    },

    keyboard: {
      height: 0
    },

    profile: {},

    activeChat: {},

    inbox: []
  });
});

afterEach(() =>
{
  deleteStore('app');

  axios.get.mockReset();

  jest.unmock('../src/i18n.js');

  cleanup();

  clear();
});

describe('Testing <App/>', () =>
{
  test('Loading Error', async() =>
  {
    // mock i18n module to throw error
    // which will make the app fail loading
    fetch.mockRejectedValueOnce('test');

    const component = render(<App/>);

    // wait for app error view
    await waitForElement(() => component.getByTestId('v-error'));

    // initial view
    const view = component.toJSON();

    expect(view).toMatchSnapshot();
  });

  test('Navigation Views', async() =>
  {
    const component = render(<App/>);

    // wait for app loading
    await waitForElement(() => component.getByTestId('v-main-area'));

    // initial view
    const initial = toJSON(component, 'v-navigation', 'one');

    expect(initial).toMatchSnapshot('Initial Navigation View Should Be Inbox');

    // switch to discover view
    // by simulating pressing the discover bottom navigation button
    fireEvent.press(component.getByTestId('bn-discover'));

    const discover = toJSON(component, 'v-navigation', 'one');

    expect(discover).toMatchSnapshot('Navigation View Should Be Discover');

    // switch back to inbox view
    // by simulating pressing the discover bottom navigation button
    fireEvent.press(component.getByTestId('bn-inbox'));

    const inbox = toJSON(component, 'v-navigation', 'one');

    // initial view should be the same as inbox
    expect(initial).toMatchDiffSnapshot(inbox);

    component.unmount();
  });

  describe('Search Bar', () =>
  {
    test('Search Bar Width (No Bottom Sheet)', async() =>
    {
      const component = render(<App/>);

      // wait for app loading
      await waitForElement(() => component.getByTestId('v-main-area'));

      const initial = toJSON(component, 'v-search', 'one');

      expect(initial).toMatchSnapshot('Initial Search Bar Should Be Minimized');

      // maximize the search bar
      // by simulating pressing the search bar button
      fireEvent.press(component.getByTestId('bn-search-maximize'));

      const maximized = toJSON(component, 'v-search', 'one');

      expect(maximized).toMatchSnapshot('Search Bar Should Be Maximized');

      // maximize the search bar
      // by simulating pressing the search bar button
      fireEvent.press(component.getByTestId('bn-search-minimize'));

      const minimized = toJSON(component, 'v-search', 'one');

      // initial should be the same as minimized
      expect(initial).toMatchDiffSnapshot(minimized);

      component.unmount();
    });

    test('Search Bar Width (2 Avatars) (With Deactivated Bottom Sheet)', async() =>
    {
      getStore('app').set({
        activeChat: {
          members: [ 'Mana', 'Mika' ],
          avatars: {
            'Mika': 1
          }
        }
      });

      const component = render(<App/>);

      // wait for app loading
      await waitForElement(() => component.getByTestId('v-main-area'));

      const bottomSheet = toJSON(component, 'v-bottom-sheet', 'one');

      expect(bottomSheet).toMatchSnapshot('Bottom Sheet Should Have Y-Axis 0');

      const initial = toJSON(component, 'v-search', 'one');

      expect(initial).toMatchSnapshot('Search Bar Should Be Minimized');

      // maximize the search bar
      // by simulating pressing the search bar button
      fireEvent.press(component.getByTestId('bn-search-maximize'));

      const maximized = toJSON(component, 'v-search', 'one');

      expect(maximized).toMatchSnapshot('Search Bar Should Be Maximize Width Default Width');

      // maximize the search bar
      // by simulating pressing the search bar button
      fireEvent.press(component.getByTestId('bn-search-minimize'));

      const minimized = toJSON(component, 'v-search', 'one');

      // initial should be the same as minimized
      expect(initial).toMatchDiffSnapshot(minimized);

      component.unmount();
    });

    test('Search Bar Width (2 Avatars) (With Activated Bottom Sheet)', async() =>
    {
      getStore('app').set({
        profile: {
          username: 'Mana'
        },
        inbox: [
          {
            displayName: 'Group of Wholesome Girls',
            members: [
              'Mana',
              'MikaTheCoolOne'
            ],
            avatars: {
              'MikaTheCoolOne': 1
            },
            messages: [
              { owner: 'MikaTheCoolOne', text: '', timestamp: new Date(1999, 9, 9) }
            ]
          }
        ]
      });

      const component = render(<App/>);

      // wait for app loading
      await waitForElement(() => component.getByTestId('v-main-area'));

      // snap the bottom sheet the top of the screen
      // this renders the chat avatars which makes search bar width thinner
      fireEvent.press(component.getByTestId('bn-chat'));

      await flushMicrotasksQueue();

      const bottomSheet = toJSON(component, 'v-bottom-sheet', 'one');

      expect(bottomSheet).toMatchSnapshot('Bottom Sheet Should Have Y-Axis Equal To Height');

      const initial = toJSON(component, 'v-search', 'one');

      expect(initial).toMatchSnapshot('Search Bar Should Be Minimized');

      // maximize the search bar
      // by simulating pressing the search bar button
      fireEvent.press(component.getByTestId('bn-search-maximize'));

      const maximized = toJSON(component, 'v-search', 'one');

      expect(maximized).toMatchSnapshot('Search Bar Should Be Maximize Width Max Width');

      // maximize the search bar
      // by simulating pressing the search bar button
      fireEvent.press(component.getByTestId('bn-search-minimize'));

      const minimized = toJSON(component, 'v-search', 'one');

      // initial should be the same as minimized
      expect(initial).toMatchDiffSnapshot(minimized);

      component.unmount();
    });

    test('Search Bar Width (3 Avatars) (With Deactivated Bottom Sheet)', async() =>
    {
      getStore('app').set({
        activeChat: {
          members: [ 'Mana', 'Mika', 'Skye' ],
          avatars: {
            'Mika': 1,
            'Skye': 2
          }
        }
      });

      const component = render(<App/>);

      // wait for app loading
      await waitForElement(() => component.getByTestId('v-main-area'));

      const bottomSheet = toJSON(component, 'v-bottom-sheet', 'one');

      expect(bottomSheet).toMatchSnapshot('Bottom Sheet Should Have Y-Axis 0');

      const initial = toJSON(component, 'v-search', 'one');

      expect(initial).toMatchSnapshot('Search Bar Should Be Minimized');

      // maximize the search bar
      // by simulating pressing the search bar button
      fireEvent.press(component.getByTestId('bn-search-maximize'));

      const maximized = toJSON(component, 'v-search', 'one');

      expect(maximized).toMatchSnapshot('Search Bar Should Be Maximize Width Default Width');

      // maximize the search bar
      // by simulating pressing the search bar button
      fireEvent.press(component.getByTestId('bn-search-minimize'));

      const minimized = toJSON(component, 'v-search', 'one');

      // initial should be the same as minimized
      expect(initial).toMatchDiffSnapshot(minimized);

      component.unmount();
    });

    test('Search Bar Width (3 Avatars) (With Activated Bottom Sheet)', async() =>
    {
      getStore('app').set({
        profile: {
          username: 'Mana'
        },
        inbox: [
          {
            displayName: 'Group of Wholesome Girls',
            members: [
              'Mana',
              'MikaTheCoolOne',
              'SkyeTheDarkLord'
            ],
            avatars: {
              'MikaTheCoolOne': 1,
              'SkyeTheDarkLord': 2
            },
            messages: [
              { owner: 'MikaTheCoolOne', text: '', timestamp: new Date(1999, 9, 9) }
            ]
          }
        ]
      });

      const component = render(<App/>);

      // wait for app loading
      await waitForElement(() => component.getByTestId('v-main-area'));

      // snap the bottom sheet the top of the screen
      // this renders the chat avatars which makes search bar width thinner
      fireEvent.press(component.getByTestId('bn-chat'));

      await flushMicrotasksQueue();

      const bottomSheet = toJSON(component, 'v-bottom-sheet', 'one');

      expect(bottomSheet).toMatchSnapshot('Bottom Sheet Should Have Y-Axis Equal To Height');

      const initial = toJSON(component, 'v-search', 'one');

      expect(initial).toMatchSnapshot('Search Bar Should Be Minimized');

      // maximize the search bar
      // by simulating pressing the search bar button
      fireEvent.press(component.getByTestId('bn-search-maximize'));

      const maximized = toJSON(component, 'v-search', 'one');

      expect(maximized).toMatchSnapshot('Search Bar Should Be Maximize Width Max Width');

      // maximize the search bar
      // by simulating pressing the search bar button
      fireEvent.press(component.getByTestId('bn-search-minimize'));

      const minimized = toJSON(component, 'v-search', 'one');

      // initial should be the same as minimized
      expect(initial).toMatchDiffSnapshot(minimized);

      component.unmount();
    });
  });

  describe('Main Menu', () =>
  {
    test('Showing and Hiding Menu', async() =>
    {
      const component = render(<App/>);

      // wait for app loading
      await waitForElement(() => component.getByTestId('v-main-area'));

      const initialMenu = toJSON(component, 'v-menu', 'one');
      const initialHolder = toJSON(component, 'v-holder');

      expect(initialMenu).toMatchSnapshot('Initial Menu View Should Be Hidden');
      expect(initialHolder).toMatchSnapshot('Initial Holder View Should Be Hidden & Disabled');
  
      // show the main menu
      // by simulating pressing the menu button
      fireEvent.press(component.getByTestId('bn-menu'));

      const activeMenu = toJSON(component, 'v-menu', 'one');
      const activeHolder = toJSON(component, 'v-holder');

      expect(activeMenu).toMatchSnapshot('Menu View Should Be Visible');
      expect(activeHolder).toMatchSnapshot('Holder View Should Be Visible & Enabled');
  
      // hide the main menu
      // by simulating pressing the menu button
      fireEvent.press(component.getByTestId('bn-menu'));

      const hiddenMenu = toJSON(component, 'v-menu', 'one');
      const hiddenHolder = toJSON(component, 'v-holder');

      // initial should be the same as hidden
      expect(initialMenu).toMatchDiffSnapshot(hiddenMenu);
      expect(initialHolder).toMatchDiffSnapshot(hiddenHolder);

      component.unmount();
    });
  });

  describe('Bottom Sheet', () =>
  {
    test('Snapping (From Inbox)', async() =>
    {
      getStore('app').set({
        profile: {
          username: 'Mana'
        },
        inbox: [
          {
            displayName: 'Mika',
            members: [
              'Mana',
              'MikaTheCoolOne'
            ],
            avatars: {
              'MikaTheCoolOne': 1
            },
            messages: [
              { owner: 'MikaTheCoolOne', text: '', timestamp: new Date(1999, 9, 9) }
            ]
          }
        ]
      });

      const component = render(<App/>);

      // wait for app loading
      await waitForElement(() => component.getByTestId('v-main-area'));
  
      const initial = toJSON(component, 'v-bottom-sheet', 'one');

      expect(initial).toMatchSnapshot('Bottom Sheet View Should Have Y-Axis 0');

      // snap the bottom sheet the top of the screen
      // by simulating pressing a chat from inbox
      fireEvent.press(component.getByTestId('bn-chat'));

      await flushMicrotasksQueue();

      const opened = toJSON(component, 'v-bottom-sheet', 'one');

      expect(opened).toMatchSnapshot('Bottom Sheet View Should Have Y-Axis Equal To Height');
      
      // snap the bottom sheet the bottom of the screen
      // by simulating pressing the hardware back button
      BackHandler.mockPressBack();

      await flushMicrotasksQueue();

      const closed = toJSON(component, 'v-bottom-sheet', 'one');

      // initial view should be the same as inbox
      expect(initial).toMatchDiffSnapshot(closed);

      component.unmount();
    });
  });

  describe('Chat', () =>
  {
    describe('Messages List', () =>
    {
      test('Normal', async() =>
      {
        getStore('app').set({
          profile: {
            username: 'Mana'
          },
          inbox: [
            {
              displayName: 'Mika',
              members: [
                'Mana',
                'MikaTheCoolOne'
              ],
              avatars: {
                'MikaTheCoolOne': 1
              },
              messages: [
                { owner: 'MikaTheCoolOne', text: 'Yay', timestamp: new Date(1999, 9, 9, 9, 0) },
                { owner: 'Mana', text: '<3', timestamp: new Date(1999, 9, 9, 9, 1) }
              ]
            }
          ]
        });
    
        const component = render(<App/>);
    
        // wait for app loading
        await waitForElement(() => component.getByTestId('v-main-area'));
  
        // snap the bottom sheet the top of the screen
        // by simulating pressing a chat from inbox
        fireEvent.press(component.getByTestId('bn-chat'));
  
        await flushMicrotasksQueue();
  
        const parent = toJSON(component, 'v-messages', 'all');
        
        expect(parent.children[0]).toMatchSnapshot('Should Be Message Without Timestamp And With A Background');
  
        expect(parent.children[1]).toMatchSnapshot('Should Be Message With Timestamp And Without A Background');
  
        // separated messages to their own snapshots
        parent.children = [];

        // to make sure when props change
        expect(parent).toMatchSnapshot();
        component.unmount();
      });

      test('Timestamps Formatting', async() =>
      {
        getStore('app').set({
          profile: {
            username: 'Mana'
          },
          inbox: [
            {
              displayName: 'Mika',
              members: [
                'Mana',
                'MikaTheCoolOne'
              ],
              avatars: {
                'MikaTheCoolOne': 1
              },
              messages: [
                { owner: 'MikaTheCoolOne', text: 'Yay', timestamp: new Date(1999, 9, 9, 9, 0) },
                { owner: 'MikaTheCoolOne', text: 'Yay', timestamp: subDays(new Date(), 3) },
                { owner: 'MikaTheCoolOne', text: 'Yay', timestamp: subDays(new Date(), 1) },
                { owner: 'MikaTheCoolOne', text: 'Yay', timestamp: new Date() }
              ]
            }
          ]
        });
    
        const component = render(<App/>);
    
        // wait for app loading
        await waitForElement(() => component.getByTestId('v-main-area'));
  
        // snap the bottom sheet the top of the screen
        // by simulating pressing a chat from inbox
        fireEvent.press(component.getByTestId('bn-chat'));
  
        await flushMicrotasksQueue();
  
        const parent = toJSON(component, 'v-messages', 'all');
        
        expect(parent.children[0]).toMatchSnapshot('Should Have A Timestamp of Today');
  
        expect(parent.children[1]).toMatchSnapshot('Should Have A Timestamp of Yesterday');
        
        expect(parent.children[2]).toMatchSnapshot('Should Have A Timestamp of This Week');
  
        expect(parent.children[3]).toMatchSnapshot('Should Have A Timestamp of Full Date');
        
        component.unmount();
      });
      
      test('With Avatars', async() =>
      {
        getStore('app').set({
          profile: {
            username: 'Mana'
          },
          inbox: [
            {
              displayName: 'Group of Wholesome Girls',
              members: [
                'Mana',
                'MikaTheCoolOne',
                'SkyeTheDarkLord'
              ],
              avatars: {
                'MikaTheCoolOne': 1,
                'SkyeTheDarkLord': 2
              },
              messages: [
                { owner: 'MikaTheCoolOne', text: 'Yay', timestamp: new Date(1999, 9, 9, 9, 0) },
                { owner: 'Mana', text: '<3', timestamp: new Date(1999, 9, 9, 9, 1) }
              ]
            }
          ]
        });
    
        const component = render(<App/>);
    
        // wait for app loading
        await waitForElement(() => component.getByTestId('v-main-area'));
  
        // snap the bottom sheet the top of the screen
        // by simulating pressing a chat from inbox
        fireEvent.press(component.getByTestId('bn-chat'));
  
        await flushMicrotasksQueue();
  
        const parent = toJSON(component, 'v-messages', 'all');
        
        expect(parent.children[0]).toMatchSnapshot('Should Be Message Without Timestamp And With A Background');
  
        expect(parent.children[1]).toMatchSnapshot('Should Be Message With Timestamp And Avatar And Without A Background');
        
        component.unmount();
      });
    });

    test('Height With Keyboard', async() =>
    {
      const store = getStore('app').set({
        profile: {
          username: 'Mana'
        },
        inbox: [
          {
            displayName: 'Mika',
            members: [
              'Mana',
              'MikaTheCoolOne'
            ],
            avatars: {
              'MikaTheCoolOne': 1
            },
            messages: [
              { owner: 'MikaTheCoolOne', text: 'Yay', timestamp: new Date(1999, 9, 9, 9, 0) },
              { owner: 'Mana', text: '<3', timestamp: new Date(1999, 9, 9, 9, 1) }
            ]
          }
        ]
      });
  
      const component = render(<App/>);
  
      // wait for app loading
      await waitForElement(() => component.getByTestId('v-main-area'));

      // snap the bottom sheet the top of the screen
      // by simulating pressing a chat from inbox
      fireEvent.press(component.getByTestId('bn-chat'));

      await flushMicrotasksQueue();

      const initial = toJSON(component, 'v-chat');

      expect(initial).toMatchSnapshot('Should Have Full Height');

      // update keyboard height
      store.set({
        keyboard: {
          height: 500
        }
      });

      const altered = toJSON(component, 'v-chat');

      expect(altered).toMatchSnapshot('Should Have Height Minus Keyboard Height & Margin');

      component.unmount();
    });
  });
});

describe('Testing <Inbox/>', () =>
{
  test('Normal View', () =>
  {
    getStore('app').set({
      profile: {
        username: 'Mana'
      },
      inbox: [
        {
          displayName: 'Mika',
          members: [
            'Mana',
            'MikaTheCoolOne'
          ],
          avatars: {
            'MikaTheCoolOne': 1
          },
          messages: [
            { owner: 'MikaTheCoolOne', text: '', timestamp: new Date(1999, 9, 9) }
          ]
        }
      ]
    });
  
    const component = render(<Inbox/>);

    expect(component.toJSON()).toMatchSnapshot('Should Be A Normal Inbox View With 1 Avatar');

    component.unmount();
  });

  test('Timestamps Formatting', () =>
  {
    getStore('app').set({
      profile: {
        username: 'Mana'
      },
      inbox: [
        {
          displayName: 'Mika',
          members: [
            'Mana',
            'MikaTheCoolOne'
          ],
          avatars: {
            'MikaTheCoolOne': 1
          },
          messages: [
            { owner: 'MikaTheCoolOne', text: 'Yay', timestamp: new Date() }
          ]
        },
        {
          displayName: 'Mika',
          members: [
            'Mana',
            'MikaTheCoolOne'
          ],
          avatars: {
            'MikaTheCoolOne': 1
          },
          messages: [
            { owner: 'MikaTheCoolOne', text: 'Yay', timestamp: subDays(new Date(), 1) }
          ]
        },
        {
          displayName: 'Mika',
          members: [
            'Mana',
            'MikaTheCoolOne'
          ],
          avatars: {
            'MikaTheCoolOne': 1
          },
          messages: [
            { owner: 'MikaTheCoolOne', text: 'Yay', timestamp: subDays(new Date(), 3) }
          ]
        },
        {
          displayName: 'Mika',
          members: [
            'Mana',
            'MikaTheCoolOne'
          ],
          avatars: {
            'MikaTheCoolOne': 1
          },
          messages: [
            { owner: 'MikaTheCoolOne', text: 'Yay', timestamp: new Date(1999, 9, 9, 9, 0) }
          ]
        }
      ]
    });
  
    const component = render(<Inbox/>);

    const parent = component.toJSON().children[0];

    expect(parent.children[0]).toMatchSnapshot('Should Have A Timestamp of Today');
  
    expect(parent.children[1]).toMatchSnapshot('Should Have A Timestamp of Yesterday');
    
    expect(parent.children[2]).toMatchSnapshot('Should Have A Timestamp of This Week');

    expect(parent.children[3]).toMatchSnapshot('Should Have A Timestamp of Full Date');

    component.unmount();
  });
  
  test('Group of 3 View', () =>
  {
    getStore('app').set({
      profile: {
        username: 'Mana'
      },
      inbox: [
        {
          displayName: 'Group of Wholesome Girls',
          members: [
            'Mana',
            'MikaTheCoolOne',
            'SkyeTheDarkLord'
          ],
          avatars: {
            'MikaTheCoolOne': 1,
            'SkyeTheDarkLord': 2
          },
          messages: [
            { owner: 'MikaTheCoolOne', text: '', timestamp: new Date(1999, 9, 9) },
            { owner: 'SkyeTheDarkLord', text: '', timestamp: new Date(2001, 1, 1) }
          ]
        }
      ]
    });
  
    const component = render(<Inbox/>);

    expect(component.toJSON()).toMatchSnapshot('Should Be A Group View With 2 Avatars');

    component.unmount();
  });

  test('Group of 4 View', () =>
  {
    getStore('app').set({
      profile: {
        username: 'Mana'
      },
      inbox: [
        {
          displayName: 'Group of Wholesome Girls',
          members: [
            'Mana',
            'MikaTheCoolOne',
            'SkyeTheDarkLord',
            'AquaTheGoddess'
          ],
          avatars: {
            'MikaTheCoolOne': 1,
            'SkyeTheDarkLord': 2,
            'AquaTheGoddess': 3
          },
          messages: [
            { owner: 'MikaTheCoolOne', text: '', timestamp: new Date(1999, 9, 9) },
            { owner: 'SkyeTheDarkLord', text: '', timestamp: new Date(2001, 1, 1) },
            { owner: 'AquaTheGoddess', text: '', timestamp: new Date(2002, 2, 2) }
          ]
        }
      ]
    });
  
    const component = render(<Inbox/>);

    expect(component.toJSON()).toMatchSnapshot('Should Be A Group View With 3 Avatars');

    component.unmount();
  });

  test('Group of 5 View', () =>
  {
    getStore('app').set({
      profile: {
        username: 'Mana'
      },
      inbox: [
        {
          displayName: 'Group of Wholesome Girls',
          members: [
            'Mana',
            'MikaTheCoolOne',
            'SkyeTheDarkLord',
            'AquaTheGoddess',
            'OrigamiTheShynificent'
          ],
          avatars: {
            'MikaTheCoolOne': 1,
            'SkyeTheDarkLord': 2,
            'AquaTheGoddess': 3,
            'OrigamiTheShynificent': 4
          },
          messages: [
            { owner: 'MikaTheCoolOne', text: '', timestamp: new Date(1999, 9, 9) },
            { owner: 'SkyeTheDarkLord', text: '', timestamp: new Date(2001, 1, 1) },
            { owner: 'AquaTheGoddess', text: '', timestamp: new Date(2002, 2, 2) },
            { owner: 'OrigamiTheShynificent', text: '', timestamp: new Date(2003, 3, 3) }
          ]
        }
      ]
    });
  
    const component = render(<Inbox/>);

    expect(component.toJSON()).toMatchSnapshot('Should Be A Group View With 4 Avatars');

    component.unmount();
  });

  test('Group of 6 View', () =>
  {
    getStore('app').set({
      profile: {
        username: 'Mana'
      },
      inbox: [
        {
          displayName: 'Group of Wholesome Girls',
          members: [
            'Mana',
            'MikaTheCoolOne',
            'SkyeTheDarkLord',
            'AquaTheGoddess',
            'OrigamiTheShynificent'
          ],
          avatars: {
            'MikaTheCoolOne': 1,
            'SkyeTheDarkLord': 2,
            'AquaTheGoddess': 3,
            'OrigamiTheShynificent': 4
          },
          messages: [
            { owner: 'MikaTheCoolOne', text: '', timestamp: new Date(1999, 9, 9) },
            { owner: 'SkyeTheDarkLord', text: '', timestamp: new Date(2001, 1, 1) },
            { owner: 'AquaTheGoddess', text: '', timestamp: new Date(2002, 2, 2) },
            { owner: 'OrigamiTheShynificent', text: '', timestamp: new Date(2003, 3, 3) }
          ]
        }
      ]
    });
  
    const groupOf5 = render(<Inbox/>);
    const groupOf5Tree= groupOf5.toJSON();

    groupOf5.unmount();

    getStore('app').set({
      profile: {
        username: 'Mana'
      },
      inbox: [
        {
          displayName: 'Group of Wholesome Girls',
          members: [
            'Mana',
            'MikaTheCoolOne',
            'SkyeTheDarkLord',
            'AquaTheGoddess',
            'OrigamiTheShynificent',
            'EmiThePsychopath'
          ],
          avatars: {
            'MikaTheCoolOne': 1,
            'SkyeTheDarkLord': 2,
            'AquaTheGoddess': 3,
            'OrigamiTheShynificent': 4,
            'EmiThePsychopath': 5
          },
          messages: [
            { owner: 'MikaTheCoolOne', text: '', timestamp: new Date(1999, 9, 9) },
            { owner: 'SkyeTheDarkLord', text: '', timestamp: new Date(2001, 1, 1) },
            { owner: 'AquaTheGoddess', text: '', timestamp: new Date(2002, 2, 2) },
            { owner: 'OrigamiTheShynificent', text: '', timestamp: new Date(2003, 3, 3) }
          ]
        }
      ]
    });

    const groupOf6 = render(<Inbox/>);
    const groupOf6Tree= groupOf6.toJSON();

    groupOf6.unmount();

    // there should be no visual difference between the 2 groups
    expect(groupOf5Tree).toMatchDiffSnapshot(groupOf6Tree);
  });
});