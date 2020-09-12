/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';

import { BackHandler } from 'react-native';

import axios from 'axios';

import { render, fireEvent, waitFor, cleanup } from 'react-native-testing-library';

import type { RenderAPI } from 'react-native-testing-library';

import type { ReactTestRendererJSON } from 'react-test-renderer';

import { subDays } from 'date-fns';

import { advanceTo, clear } from 'jest-date-mock';

import { InboxEntry, Profile } from '../src/types';

import { fetch } from '../src/i18n';

import { createStore, getStore } from '../src/store';

import App from '../src/app';

import Inbox from '../src/screens/Inbox';

/** splits react testing library json trees to parts to make it easier to review
*/
function toJSON(renderer: RenderAPI, testId: string, shallow?: 'none' | 'one' | 'all'): ReactTestRendererJSON | undefined
{
  function getByTestId(tree: ReactTestRendererJSON, testId: string): ReactTestRendererJSON | undefined
  {
    if (!tree)
      return;
      
    if (tree.props?.['testID'] === testId)
      return tree;

    for (let i = 0; i < (tree.children ?? []).length; i++)
    {
      // eslint-disable-next-line security/detect-object-injection
      if (typeof tree.children?.[i] === 'object')
      {
        // eslint-disable-next-line security/detect-object-injection
        const o = getByTestId(tree.children?.[i] as ReactTestRendererJSON, testId);

        if (o !== undefined)
          return o;
      }
    }

    return;
  }

  // default shallow is 'none'
  shallow = shallow ?? 'none';

  const tree = renderer.toJSON() as ReactTestRendererJSON;

  let target: ReactTestRendererJSON | undefined;

  if (!testId)
    target = tree;
  else
    target = getByTestId(tree as ReactTestRendererJSON, testId);

  if (!target)
    return;

  if (shallow === 'none')
    target.children = [];
  else if (shallow === 'one')
    target.children?.forEach((c: any) => c.children = []);
  
  return target;
}

// mocks axios
const axiosMock = axios.get = jest.fn().mockResolvedValue({ data: { test: true } });

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(true),
  hideAsync: jest.fn().mockResolvedValue(true)
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
          this.props.data.map((item: any, index: number) =>
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

    snapTo(index: number)
    {
      // execute callback
      if (index === 1)
        this.props.onCloseEnd?.();
      else if (index === 0)
        this.props.onOpenStart?.();

      // update callbackNode value
      this.props.callbackNode?.setValue(index);
      
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
        setValue: (value: number) => v = value,
        interpolate: ({ inputRange, outputRange }: any) => outputRange[inputRange.indexOf(v)]
      };
    }),
    Easing: jest.fn()
  };
});

jest.mock('../src/i18n', () => ({
  __esModule: true,
  default: jest.fn(),
  locale: { id: 'mika' },
  fetch: jest.fn().mockResolvedValue('')
}));

beforeEach(() =>
{
  advanceTo(new Date(2144, 0, 0));

  createStore({
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
  axiosMock.mockReset();

  cleanup();

  clear();
});

describe('Testing <App/>', () =>
{
  test('Loading Error', async() =>
  {
    // mock i18n module to throw error
    // which will make the app fail loading
    (fetch as jest.MockedFunction<any>).mockRejectedValueOnce('test');

    const component = render(<App/>);

    // wait for app error view
    await waitFor(() => component.getByTestId('v-error'));

    // initial view
    const view = component.toJSON();

    expect(view).toMatchSnapshot();
  });

  test('Navigation Views', async() =>
  {
    const component = render(<App/>);

    // wait for app loading
    await waitFor(() => component.getByTestId('v-main-area'));

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
    test('Width (With Deactivated Bottom Sheet)', async() =>
    {
      const component = render(<App/>);

      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));

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

    test('Width (2 Avatars) (With Deactivated Bottom Sheet)', async() =>
    {
      getStore().set({
        activeChat: {
          id: '0',
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1
            }
          ]
        } as InboxEntry
      });

      const component = render(<App/>);

      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));

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

    test('Width (2 Avatars) (With Activated Bottom Sheet)', async() =>
    {
      getStore().set({
        profile: {
          displayName: 'Mana',
          username: 'Mana',
          avatar: 0
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
      await waitFor(() => component.getByTestId('v-main-area'));

      // snap the bottom sheet the top of the screen
      // this renders the chat avatars which makes search bar width thinner
      fireEvent.press(component.getByTestId('bn-chat'));

      await waitFor(() => true);

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

    test('Width (3 Avatars)', async() =>
    {
      getStore().set({
        profile: {
          displayName: 'Mana',
          username: 'Mana',
          avatar: 0
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
      await waitFor(() => component.getByTestId('v-main-area'));

      // snap the bottom sheet the top of the screen
      // this renders the chat avatars which makes search bar width thinner
      fireEvent.press(component.getByTestId('bn-chat'));

      await waitFor(() => true);

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

  describe('Chat Avatars', () =>
  {
    test('1 Avatars', async() =>
    {
      getStore().set({
        profile: {
          displayName: 'Mana',
          username: 'Mana',
          avatar: 0
        }
      });

      const component = render(<App/>);

      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));

      const menu = toJSON(component, 'bn-menu', 'all');

      expect(menu).toMatchSnapshot('Should Have 1 Avatar');

      component.unmount();
    });

    test('2 Avatars', async() =>
    {
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0
        } as Profile,
        activeChat: {
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1
            }
          ]
        } as InboxEntry,
        inbox: [
          {
            id: '0',
            displayName: 'Mika',
            members: [
              {
                uuid: '0',
                avatar: 0
              },
              {
                uuid: '1',
                avatar: 1
              }
            ],
            messages: [
              { owner: '1', text: '', timestamp: new Date(1999, 9, 9) }
            ]
          }
        ] as InboxEntry[]
      });

      const component = render(<App/>);

      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));

      const initial = toJSON(component, 'bn-menu', 'all');

      expect(initial).toMatchSnapshot('Should Have Client Avatar And Deactivated Chat Avatars');

      // snap the bottom sheet the top of the screen
      // this enables the chat avatars
      fireEvent.press(component.getByTestId('bn-chat'));

      await waitFor(() => true);

      // workaround:
      // force update the menu since the mock of reanimated value doesn't update components
      fireEvent.press(component.getByTestId('bn-menu'));

      const active = toJSON(component, 'bn-menu', 'all');
  
      expect(active).toMatchSnapshot('Should Have Client Avatar And 1 Chat Avatar');

      component.unmount();
    });

    test('3 Avatars', async() =>
    {
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0
        } as Profile,
        activeChat: {
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1
            },
            {
              uuid: '2',
              avatar: 2
            }
          ]
        } as InboxEntry,
        inbox: [
          {
            id: '0',
            displayName: 'Mika',
            members: [
              {
                uuid: '0',
                avatar: 0
              },
              {
                uuid: '1',
                avatar: 1
              },
              {
                uuid: '2',
                avatar: 2
              }
            ],
            messages: [
              { owner: '1', text: '', timestamp: new Date(1999, 9, 9) }
            ]
          }
        ] as InboxEntry[]
      });

      const component = render(<App/>);

      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));

      const initial = toJSON(component, 'bn-menu', 'all');

      expect(initial).toMatchSnapshot('Should Have Client Avatar And Deactivated Chat Avatars');

      // snap the bottom sheet the top of the screen
      // this enables the chat avatars
      fireEvent.press(component.getByTestId('bn-chat'));

      await waitFor(() => true);

      // workaround:
      // force update the menu since the mock of reanimated value doesn't update components
      fireEvent.press(component.getByTestId('bn-menu'));

      const active = toJSON(component, 'bn-menu', 'all');
  
      expect(active).toMatchSnapshot('Should Have Client Avatar And 2 Chat Avatar');

      component.unmount();
    });

    test('4 Avatars', async() =>
    {
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0
        } as Profile,
        activeChat: {
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1
            },
            {
              uuid: '2',
              avatar: 2
            }
          ]
        } as InboxEntry,
        inbox: [
          {
            id: '0',
            displayName: 'Mika',
            members: [
              {
                uuid: '0',
                avatar: 0
              },
              {
                uuid: '1',
                avatar: 1
              },
              {
                uuid: '2',
                avatar: 2
              },
              {
                uuid: '3',
                avatar: 3
              }
            ],
            messages: [
              { owner: '1', text: '', timestamp: new Date(1999, 9, 9) }
            ]
          }
        ] as InboxEntry[]
      });


      const component = render(<App/>);

      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));

      const initial = toJSON(component, 'bn-menu', 'all');

      expect(initial).toMatchSnapshot('Should Have Client Avatar And Deactivated Chat Avatars');

      // snap the bottom sheet the top of the screen
      // this enables the chat avatars
      fireEvent.press(component.getByTestId('bn-chat'));

      await waitFor(() => true);

      // workaround:
      // force update the menu since the mock of reanimated value doesn't update components
      fireEvent.press(component.getByTestId('bn-menu'));

      const active = toJSON(component, 'bn-menu', 'all');
  
      expect(active).toMatchSnapshot('Should Have Client Avatar And 2 Chat Avatar');

      component.unmount();
    });
  });

  describe('Main Menu', () =>
  {
    test('Showing and Hiding Menu', async() =>
    {
      const component = render(<App/>);

      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));

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
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0
        } as Profile,
        inbox: [
          {
            id: '0',
            displayName: 'Mika',
            members: [
              {
                uuid: '0',
                avatar: 0
              },
              {
                uuid: '1',
                avatar: 1
              }
            ],
            messages: [
              { owner: '1', text: '', timestamp: new Date(1999, 9, 9) }
            ]
          }
        ] as InboxEntry[]
      });

      const component = render(<App/>);

      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));
  
      const initial = toJSON(component, 'v-bottom-sheet', 'one');

      expect(initial).toMatchSnapshot('Bottom Sheet View Should Have Y-Axis 0');

      // snap the bottom sheet the top of the screen
      // by simulating pressing a chat from inbox
      fireEvent.press(component.getByTestId('bn-chat'));

      await waitFor(() => true);

      const opened = toJSON(component, 'v-bottom-sheet', 'one');

      expect(opened).toMatchSnapshot('Bottom Sheet View Should Have Y-Axis Equal To Height');
      
      // snap the bottom sheet the bottom of the screen
      // by simulating pressing the hardware back button
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      BackHandler.mockPressBack();

      await waitFor(() => true);

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
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0
          } as Profile,
          inbox: [
            {
              id: '0',
              displayName: 'Mika',
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1
                }
              ],
              messages: [
                { owner: '1', text: 'Yay', timestamp: new Date(1999, 9, 9, 9, 0) },
                { owner: '0', text: '<3', timestamp: new Date(1999, 9, 9, 9, 1) }
              ]
            }
          ] as InboxEntry[]
        });
    
        const component = render(<App/>);
    
        // wait for app loading
        await waitFor(() => component.getByTestId('v-main-area'));
  
        // snap the bottom sheet the top of the screen
        // by simulating pressing a chat from inbox
        fireEvent.press(component.getByTestId('bn-chat'));
  
        await waitFor(() => true);
  
        const parent = toJSON(component, 'v-messages', 'all');
        
        expect(parent?.children?.[0]).toMatchSnapshot('Should Be Message Without Timestamp And With A Background');
  
        expect(parent?.children?.[1]).toMatchSnapshot('Should Be Message With Timestamp And Without A Background');
  
        // separated messages to their own snapshots
        if (parent)
          parent.children = [];

        // to make sure when props change
        expect(parent).toMatchSnapshot();

        component.unmount();
      });

      test('Timestamps Formatting', async() =>
      {
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0
          } as Profile,
          inbox: [
            {
              id: '0',
              displayName: 'Mika',
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1
                }
              ],
              messages: [
                { owner: '1', text: 'Yay', timestamp: new Date(1999, 9, 9, 9, 0) },
                { owner: '1', text: 'Yay', timestamp: subDays(new Date(), 3) },
                { owner: '1', text: 'Yay', timestamp: subDays(new Date(), 1) },
                { owner: '1', text: 'Yay', timestamp: new Date() }
              ]
            }
          ] as InboxEntry[]
        });
    
        const component = render(<App/>);
    
        // wait for app loading
        await waitFor(() => component.getByTestId('v-main-area'));
  
        // snap the bottom sheet the top of the screen
        // by simulating pressing a chat from inbox
        fireEvent.press(component.getByTestId('bn-chat'));
  
        await waitFor(() => true);
  
        const parent = toJSON(component, 'v-messages', 'all');
        
        expect(parent?.children?.[0]).toMatchSnapshot('Should Have A Timestamp of Today');
  
        expect(parent?.children?.[1]).toMatchSnapshot('Should Have A Timestamp of Yesterday');
        
        expect(parent?.children?.[2]).toMatchSnapshot('Should Have A Timestamp of This Week');
  
        expect(parent?.children?.[3]).toMatchSnapshot('Should Have A Timestamp of Full Date');
        
        component.unmount();
      });
      
      test('With Avatars', async() =>
      {
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0
          } as Profile,
          inbox: [
            {
              id: '0',
              displayName: 'Group of Wholesome Girls',
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1
                },
                {
                  uuid: '2',
                  avatar: 2
                }
              ],
              messages: [
                { owner: '1', text: 'Yay', timestamp: new Date(1999, 9, 9, 9, 0) },
                { owner: '0', text: '<3', timestamp: new Date(1999, 9, 9, 9, 1) }
              ]
            }
          ] as InboxEntry[]
        });
    
        const component = render(<App/>);
    
        // wait for app loading
        await waitFor(() => component.getByTestId('v-main-area'));
  
        // snap the bottom sheet the top of the screen
        // by simulating pressing a chat from inbox
        fireEvent.press(component.getByTestId('bn-chat'));
  
        await waitFor(() => true);
  
        const parent = toJSON(component, 'v-messages', 'all');
        
        expect(parent?.children?.[0]).toMatchSnapshot('Should Be Message Without Timestamp And With A Background');
  
        expect(parent?.children?.[1]).toMatchSnapshot('Should Be Message With Timestamp And Avatar And Without A Background');
        
        component.unmount();
      });
    });

    test('Height With Keyboard', async() =>
    {
      const store = getStore().set({
        profile: {
          uuid: '0',
          avatar: 0
        } as Profile,
        inbox: [
          {
            id: '0',
            displayName: 'Mika',
            members: [
              {
                uuid: '0',
                avatar: 0
              },
              {
                uuid: '1',
                avatar: 1
              }
            ],
            messages: [
              { owner: '1', text: 'Yay', timestamp: new Date(1999, 9, 9, 9, 0) },
              { owner: '0', text: '<3', timestamp: new Date(1999, 9, 9, 9, 1) }
            ]
          }
        ] as InboxEntry[]
      });
  
      const component = render(<App/>);
  
      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));

      // snap the bottom sheet the top of the screen
      // by simulating pressing a chat from inbox
      fireEvent.press(component.getByTestId('bn-chat'));

      await waitFor(() => true);

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
    getStore().set({
      profile: {
        uuid: '0',
        avatar: 0
      } as Profile,
      inbox: [
        {
          id: '0',
          displayName: 'Mika',
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1
            }
          ],
          messages: [
            { owner: '1', text: '', timestamp: new Date(1999, 9, 9, 9) }
          ]
        }
      ] as InboxEntry[]
    });
  
    const component = render(<Inbox/>);

    expect(component.toJSON()).toMatchSnapshot('Should Be A Normal Inbox View With 1 Avatar');

    component.unmount();
  });

  test('Timestamps Formatting', () =>
  {
    getStore().set({
      profile: {
        uuid: '0',
        avatar: 0
      } as Profile,
      inbox: [
        {
          id: '0',
          displayName: 'Mika',
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1
            }
          ],
          messages: [
            { owner: '1', text: 'Yay', timestamp: new Date() }
          ]
        },
        {
          id: '1',
          displayName: 'Mika',
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1
            }
          ],
          messages: [
            { owner: '1', text: 'Yay', timestamp: subDays(new Date(), 1) }
          ]
        },
        {
          id: '2',
          displayName: 'Mika',
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1
            }
          ],
          messages: [
            { owner: '1', text: 'Yay', timestamp: subDays(new Date(), 3) }
          ]
        },
        {
          id: '3',
          displayName: 'Mika',
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1
            }
          ],
          messages: [
            { owner: '1', text: 'Yay', timestamp: new Date(1999, 9, 9, 9, 0) }
          ]
        }
      ] as InboxEntry[]
    });
  
    const component = render(<Inbox/>);

    const parent = component.toJSON()?.children?.[0] as ReactTestRendererJSON;

    expect(parent?.children?.[0]).toMatchSnapshot('Should Have A Timestamp of Today');
  
    expect(parent?.children?.[1]).toMatchSnapshot('Should Have A Timestamp of Yesterday');
    
    expect(parent?.children?.[2]).toMatchSnapshot('Should Have A Timestamp of This Week');

    expect(parent?.children?.[3]).toMatchSnapshot('Should Have A Timestamp of Full Date');

    component.unmount();
  });
  
  test('Group of 3 View', () =>
  {
    getStore().set({
      profile: {
        uuid: '0',
        avatar: 0
      } as Profile,
      inbox: [
        {
          id: '0',
          displayName: 'Group of Wholesome Girls',
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1
            },
            {
              uuid: '2',
              avatar: 2
            }
          ],
          messages: [
            { owner: '1', text: '', timestamp: new Date(1999, 9, 9) },
            { owner: '2', text: '', timestamp: new Date(2001, 1, 1) }
          ]
        }
      ] as InboxEntry[]
    });
  
    const component = render(<Inbox/>);

    expect(component.toJSON()).toMatchSnapshot('Should Be A Group View With 2 Avatars');

    component.unmount();
  });

  test('Group of 4 View', () =>
  {
    getStore().set({
      profile: {
        uuid: '0',
        avatar: 0
      } as Profile,
      inbox: [
        {
          id: '0',
          displayName: 'Group of Wholesome Girls',
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1
            },
            {
              uuid: '2',
              avatar: 2
            },
            {
              uuid: '3',
              avatar: 3
            }
          ],
          messages: [
            { owner: '1', text: '', timestamp: new Date(1999, 9, 9) },
            { owner: '2', text: '', timestamp: new Date(2001, 1, 1) },
            { owner: '3', text: '', timestamp: new Date(2002, 2, 2) }
          ]
        }
      ] as InboxEntry[]
    });

    const component = render(<Inbox/>);

    expect(component.toJSON()).toMatchSnapshot('Should Be A Group View With 3 Avatars');

    component.unmount();
  });

  test('Group of 5 View', () =>
  {
    getStore().set({
      profile: {
        uuid: '0',
        avatar: 0
      } as Profile,
      inbox: [
        {
          id: '0',
          displayName: 'Group of Wholesome Girls',
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1
            },
            {
              uuid: '2',
              avatar: 2
            },
            {
              uuid: '3',
              avatar: 3
            },
            {
              uuid: '4',
              avatar: 4
            }
          ],
          messages: [
            { owner: '1', text: '', timestamp: new Date(1999, 9, 9) },
            { owner: '2', text: '', timestamp: new Date(2001, 1, 1) },
            { owner: '3', text: '', timestamp: new Date(2002, 2, 2) },
            { owner: '4', text: '', timestamp: new Date(2003, 3, 3) }
          ]
        }
      ] as InboxEntry[]
    });
  
    const component = render(<Inbox/>);

    expect(component.toJSON()).toMatchSnapshot('Should Be A Group View With 4 Avatars');

    component.unmount();
  });

  test('Group of 6 View', () =>
  {
    getStore().set({
      profile: {
        uuid: '0',
        avatar: 0
      } as Profile,
      inbox: [
        {
          id: '0',
          displayName: 'Group of Wholesome Girls',
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1
            },
            {
              uuid: '2',
              avatar: 2
            },
            {
              uuid: '3',
              avatar: 3
            },
            {
              uuid: '4',
              avatar: 4
            }
          ],
          messages: [
            { owner: '1', text: '', timestamp: new Date(1999, 9, 9) },
            { owner: '2', text: '', timestamp: new Date(2001, 1, 1) },
            { owner: '3', text: '', timestamp: new Date(2002, 2, 2) },
            { owner: '4', text: '', timestamp: new Date(2003, 3, 3) }
          ]
        }
      ] as InboxEntry[]
    });
  
    const groupOf5 = render(<Inbox/>);
    const groupOf5Tree= groupOf5.toJSON();

    groupOf5.unmount();

    getStore().set({
      profile: {
        uuid: '0',
        avatar: 0
      } as Profile,
      inbox: [
        {
          id: '0',
          displayName: 'Group of Wholesome Girls',
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1
            },
            {
              uuid: '2',
              avatar: 2
            },
            {
              uuid: '3',
              avatar: 3
            },
            {
              uuid: '4',
              avatar: 4
            },
            {
              uuid: '5',
              avatar: 5
            }
          ],
          messages: [
            { owner: '1', text: '', timestamp: new Date(1999, 9, 9) },
            { owner: '2', text: '', timestamp: new Date(2001, 1, 1) },
            { owner: '3', text: '', timestamp: new Date(2002, 2, 2) },
            { owner: '4', text: '', timestamp: new Date(2003, 3, 3) }
          ]
        }
      ] as InboxEntry[]
    });

    const groupOf6 = render(<Inbox/>);
    const groupOf6Tree= groupOf6.toJSON();

    groupOf6.unmount();

    // there should be no visual difference between the 2 groups
    expect(groupOf5Tree).toMatchDiffSnapshot(groupOf6Tree);
  });
});