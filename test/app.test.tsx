/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';

import { BackHandler } from 'react-native';

import * as Linking from 'expo-linking';

import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';

import type { RenderAPI } from '@testing-library/react-native';

import type { ReactTestInstance, ReactTestRendererJSON } from 'react-test-renderer';

import { subDays, subMinutes } from 'date-fns';

import { advanceTo, clear } from 'jest-date-mock';

import { InboxEntry, Profile as TProfile } from '../src/types';

import { createStore, getStore } from '../src/store';

import App from '../src/app';

import Inbox from '../src/screens/Inbox';

import Profile from '../src/screens/Profile';

function getByTestId(tree: ReactTestRendererJSON, testId: string): ReactTestRendererJSON | undefined
{
  if (!tree)
    return;
    
  if (tree.props?.['testID'] === testId)
    return tree;

  for (let i = 0; i < (tree.children ?? []).length; i++)
  {
    if (typeof tree.children?.[i] === 'object')
    {
      const o = getByTestId(tree.children?.[i] as ReactTestRendererJSON, testId);

      if (o !== undefined)
        return o;
    }
  }
}

/** splits react testing library json trees to parts to make it easier to review
*/
function toJSON(renderer: RenderAPI, testId: string, shallow?: 'none' | 'one' | 'all'): ReactTestRendererJSON | undefined
{
  // default shallow is 'none'
  shallow = shallow ?? 'none';

  const tree = renderer.toJSON() as ReactTestRendererJSON;

  let target: ReactTestRendererJSON | undefined;

  if (!testId)
    target = tree;
  else
    target = getByTestId(tree, testId);

  if (!target)
    return;

  if (shallow === 'none')
    target.children = [];
  else if (shallow === 'one')
    target.children?.forEach((c: any) => c.children = []);
  
  return target;
}

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(true),
  hideAsync: jest.fn().mockResolvedValue(true)
}));

jest.mock('expo-linking', () => ({
  openURL: jest.fn().mockResolvedValue(true)
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
      {
        this.props.onCloseStart?.();
        this.props.onCloseEnd?.();
      }
      else if (index === 0)
      {
        this.props.onOpenStart?.();
        this.props.onOpenEnd?.();
      }

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

            // force update all the things
            callback({ finished: true })?.store.subscriptions.forEach((component: React.Component) => component.forceUpdate());
          }
        })
      };
    }),
    View: View,
    EasingNode: {
      linear: 0,
      in: jest.fn(),
      out: jest.fn(),
      inOut: jest.fn()
    },
    Value: jest.fn().mockImplementation(value =>
    {
      let v = value || 0;
  
      return {
        get: () => v,
        setValue: (newValue: number) => v = newValue,
        interpolate: ({ inputRange, outputRange }: any) => outputRange[inputRange.indexOf(v)]
      };
    })
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
  advanceTo(new Date(2144, 0, 0, 12, 0, 0, 0));

  createStore({
    index: 0,
    holder: false,

    size:
    {
      width: 523,
      height: 1131
    },

    profile: {},

    activeChat: undefined,

    inputs: {},

    inbox: []
  });
});

afterEach(() =>
{
  (Linking.openURL as jest.Mock).mockReset();

  cleanup();

  clear();
});

describe('Testing <App/>', () =>
{
  test('Navigation Views', async() =>
  {
    getStore().set({
      profile: {
        uuid: '0',
        avatar: 0,
        fullName: 'User',
        nickname: 'User',
        info: {
          romantically: 'Closed',
          gender: 'Woman',
          speaks: [ 'English' ]
        },
        interests: [ 'A', 'B', 'C' ]
      } as TProfile
    });

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
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile
      });

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
        profile: {
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile,
        inbox: [ {
          id: '0',
          createdAt: new Date(1999, 9, 9),
          updatedAt: new Date(1999, 9, 9),
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1,
              fullName: 'Mika',
              nickname: 'Mika',
              info: {
                romantically: 'Closed',
                gender: 'Woman',
                speaks: [ 'English' ]
              },
              interests: [] as string[]
            },
            {
              uuid: '2',
              avatar: 2,
              fullName: 'Skye',
              nickname: 'Skye',
              info: {
                romantically: 'Closed',
                gender: 'Woman',
                speaks: [ 'English' ]
              },
              interests: [] as string[]
            }
          ],
          messages: [
            { owner: '1', text: '', createdAt: new Date(1999, 9, 9) }
          ]
        } ] as InboxEntry[]
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
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile,
        inbox: [ {
          id: '0',
          createdAt: new Date(1999, 9, 9),
          updatedAt: new Date(1999, 9, 9),
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1,
              fullName: 'Mika',
              nickname: 'Mika',
              info: {
                romantically: 'Closed',
                gender: 'Woman',
                speaks: [ 'English' ]
              },
              interests: [] as string[]
            },
            {
              uuid: '2',
              avatar: 2,
              fullName: 'Skye',
              nickname: 'Skye',
              info: {
                romantically: 'Closed',
                gender: 'Woman',
                speaks: [ 'English' ]
              },
              interests: [] as string[]
            }
          ],
          messages: [
            { owner: '1', text: '', createdAt: new Date(1999, 9, 9) }
          ]
        } ] as InboxEntry[]
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
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile,
        inbox: [ {
          id: '0',
          createdAt: new Date(1999, 9, 9),
          updatedAt: new Date(1999, 9, 9),
          members: [
            {
              uuid: '0',
              avatar: 0
            },
            {
              uuid: '1',
              avatar: 1,
              fullName: 'Mika',
              nickname: 'Mika',
              info: {
                romantically: 'Closed',
                gender: 'Woman',
                speaks: [ 'English' ]
              },
              interests: [] as string[]
            },
            {
              uuid: '2',
              avatar: 2,
              fullName: 'Skye',
              nickname: 'Skye',
              info: {
                romantically: 'Closed',
                gender: 'Woman',
                speaks: [ 'English' ]
              },
              interests: [] as string[]
            }
          ],
          messages: [
            { owner: '1', text: '', createdAt: new Date(1999, 9, 9) }
          ]
        } ] as InboxEntry[]
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
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile
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
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile,
        inbox: [
          {
            id: '0',
            displayName: 'Mika',
            createdAt: new Date(1999, 9, 9),
            updatedAt: new Date(1999, 9, 9),
            members: [
              {
                uuid: '0',
                avatar: 0
              },
              {
                uuid: '1',
                avatar: 1,
                fullName: 'Mika',
                nickname: 'Mika',
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                interests: [] as string[]
              }
            ],
            messages: [
              { owner: '1', text: '<3', createdAt: new Date(1999, 9, 9) }
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
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile,
        inbox: [
          {
            id: '0',
            displayName: 'Mika',
            createdAt: new Date(1999, 9, 9),
            updatedAt: new Date(1999, 9, 9),
            members: [
              {
                uuid: '0',
                avatar: 0
              },
              {
                uuid: '1',
                avatar: 1,
                fullName: 'Mika',
                nickname: 'Mika',
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                interests: [] as string[]
              },
              {
                uuid: '2',
                avatar: 2,
                fullName: 'Skye',
                nickname: 'Skye',
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                interests: [] as string[]
              }
            ],
            messages: [
              { owner: '1', text: '<3', createdAt: new Date(1999, 9, 9) }
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
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile,
        inbox: [
          {
            id: '0',
            displayName: 'Mika',
            createdAt: new Date(1999, 9, 9),
            updatedAt: new Date(1999, 9, 9),
            members: [
              {
                uuid: '0',
                avatar: 0
              },
              {
                uuid: '1',
                avatar: 1,
                fullName: 'Mika',
                nickname: 'Mika',
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                interests: [] as string[]
              },
              {
                uuid: '2',
                avatar: 2,
                fullName: 'Skye',
                nickname: 'Skye',
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                interests: [] as string[]
              },
              {
                uuid: '3',
                avatar: 3,
                fullName: 'Mana',
                nickname: 'Mana',
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                interests: [] as string[]
              }
            ],
            messages: [
              { owner: '1', text: '<3', createdAt: new Date(1999, 9, 9) }
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

  describe('Menus', () =>
  {
    test('Showing and Hiding Main Menu', async() =>
    {
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile
      });

      const component = render(<App/>);

      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));

      const initialMenu = toJSON(component, 'v-menu', 'all');
      const initialHolder = toJSON(component, 'v-holder');

      expect(initialMenu).toMatchSnapshot('Initial Menu View Should Be Hidden');
      expect(initialHolder).toMatchSnapshot('Initial Holder View Should Be Hidden & Disabled');
  
      // show the main menu
      // by simulating pressing the menu button
      fireEvent.press(component.getByTestId('bn-menu'));

      await waitFor(() => true);

      const activeMenu = toJSON(component, 'v-menu', 'all');
      const activeHolder = toJSON(component, 'v-holder');

      expect(activeMenu).toMatchSnapshot('Menu View Should Be Visible');
      expect(activeHolder).toMatchSnapshot('Holder View Should Be Visible & Enabled');
  
      // hide the main menu
      // by simulating pressing the hardware back button
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      BackHandler.mockPressBack();

      await waitFor(() => true);

      const hiddenMenu = toJSON(component, 'v-menu', 'all');
      const hiddenHolder = toJSON(component, 'v-holder');

      // initial should be the same as hidden
      expect(initialMenu).toMatchDiffSnapshot(hiddenMenu);
      expect(initialHolder).toMatchDiffSnapshot(hiddenHolder);

      component.unmount();
    });
 
    test.skip('Opening Privacy Policy', async() =>
    {
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile
      });

      const component = render(<App/>);

      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));

      // show the main menu
      // by simulating pressing the menu button
      fireEvent.press(component.getByTestId('bn-privacy'));

      expect(Linking.openURL).toHaveBeenCalledTimes(1);

      expect(Linking.openURL).toHaveBeenCalledWith('https://herpproject.com/abram/privacy');
    });

    test.skip('Opening Terms of Service', async() =>
    {
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile
      });

      const component = render(<App/>);

      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));

      // show the main menu
      // by simulating pressing the menu button
      fireEvent.press(component.getByTestId('bn-terms'));

      expect(Linking.openURL).toHaveBeenCalledTimes(1);

      expect(Linking.openURL).toHaveBeenCalledWith('https://herpproject.com/abram/terms');
    });

    test.skip('Opening Ethics', async() =>
    {
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile
      });

      const component = render(<App/>);

      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));

      // show the main menu
      // by simulating pressing the menu button
      fireEvent.press(component.getByTestId('bn-ethics'));

      expect(Linking.openURL).toHaveBeenCalledTimes(1);

      expect(Linking.openURL).toHaveBeenCalledWith('https://herpproject.com/abram/ethics');
    });
  
    test('Navigating to Profile', async() =>
    {
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile
      });

      const component = render(<App/>);

      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));

      fireEvent.press(component.getByTestId('bn-menu'));

      await waitFor(() => true);

      fireEvent.press(component.getByTestId('bn-profile'));

      await waitFor(() => true);

      const menu = toJSON(component, 'v-menu', 'one');
      const holder = toJSON(component, 'v-holder');

      expect(menu).toMatchSnapshot('Menu View Should Be Hidden');
      expect(holder).toMatchSnapshot('Holder View Should Be Hidden');

      const bottom = toJSON(component, 'v-bottom', 'all');
      
      const profile = toJSON(component, 'v-navigation', 'one');

      expect(bottom).toMatchSnapshot('Bottom Should Have A Additional Button With Profile Icon');

      expect(profile).toMatchSnapshot('Navigation View Should Be Profile');
    });
 
    test('Showing Normal Chat Menu', async() =>
    {
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile,
        inbox: [
          {
            id: '0',
            displayName: 'Mika',
            createdAt: new Date(),
            updatedAt: new Date(),
            members: [
              {
                uuid: '0',
                avatar: 0
              },
              {
                uuid: '1',
                fullName: 'Mika',
                nickname: 'Mika',
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                avatar: 1,
                interests: [] as string[]
              }
            ],
            messages: [
              { owner: '1', text: 'Yay', createdAt: new Date() }
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

      // show the main menu
      // by simulating pressing the menu button
      fireEvent.press(component.getByTestId('bn-menu'));

      await waitFor(() => true);

      const activeMenu = toJSON(component, 'v-menu', 'all');
      const activeHolder = toJSON(component, 'v-holder');

      expect(activeMenu).toMatchSnapshot('Menu View Should Be Visible');
      expect(activeHolder).toMatchSnapshot('Holder View Should Be Visible & Enabled');

      component.unmount();
    });

    test('Showing Group Chat Menu', async() =>
    {
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile,
        inbox: [
          {
            id: '0',
            displayName: 'Group of Wholesome Girls',
            createdAt: new Date(1999, 9, 9),
            updatedAt: new Date(2001, 1, 1),
            members: [
              {
                uuid: '0',
                avatar: 0
              },
              {
                uuid: '1',
                avatar: 1,
                fullName: 'Mika',
                nickname: 'Mika',
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                interests: [] as string[]
              },
              {
                uuid: '2',
                avatar: 2,
                fullName: 'Skye',
                nickname: 'Skye',
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                interests: [] as string[]
              }
            ],
            messages: [
              { owner: '1', text: '', createdAt: new Date(1999, 9, 9) },
              { owner: '2', text: '', createdAt: new Date(2001, 1, 1) }
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

      // show the main menu
      // by simulating pressing the menu button
      fireEvent.press(component.getByTestId('bn-menu'));

      await waitFor(() => true);

      const activeMenu = toJSON(component, 'v-menu', 'all');
      const activeHolder = toJSON(component, 'v-holder');

      expect(activeMenu).toMatchSnapshot('Menu View Should Be Visible');
      expect(activeHolder).toMatchSnapshot('Holder View Should Be Visible & Enabled');

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
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile,
        inbox: [
          {
            id: '0',
            displayName: 'Mika',
            createdAt: new Date(1999, 9, 9),
            updatedAt: new Date(1999, 9, 9),
            members: [
              {
                uuid: '0',
                avatar: 0
              },
              {
                uuid: '1',
                avatar: 1,
                fullName: 'Mika',
                nickname: 'Mika',
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                interests: [] as string[]
              }
            ],
            messages: [
              { owner: '1', text: '<3', createdAt: new Date(1999, 9, 9) }
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
    
  describe('Profile', () =>
  {
    describe('Others', () =>
    {
      test('Interests Popup', async() =>
      {
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0,
            fullName: 'User',
            nickname: 'User',
            info: {
              romantically: 'Closed',
              gender: 'Woman',
              speaks: [ 'English' ]
            },
            interests: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
          } as TProfile,
          inbox: [
            {
              id: '0',
              displayName: 'Mika',
              createdAt: new Date(),
              updatedAt: new Date(),
              members: [
                {
                  uuid: '0',
                  avatar: 0,
                  interests: [] as string[]
                },
                {
                  uuid: '1',
                  avatar: 1,
                  fullName: 'Mika',
                  nickname: 'Mika',
                  info: {
                    gender: 'Woman',
                    romantically: 'Closed',
                    speaks: [ 'English' ]
                  },
                  interests: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K' ] as string[]
                }
              ],
              messages: [] as InboxEntry['messages']
            }
          ] as InboxEntry[]
        });
  
        const component = render(<App/>);
  
        // wait for app loading
        await waitFor(() => component.getByTestId('v-main-area'));
  
        // snap the bottom sheet the top of the screen
        // by simulating pressing a chat from inbox
        fireEvent.press(component.getAllByTestId('bn-chat')[0]);
    
        await waitFor(() => true);
  
        // activate menu view
        fireEvent.press(component.getByTestId('bn-menu'));
  
        await waitFor(() => true);
  
        // activate profile view
        fireEvent.press(component.getByTestId('bn-chat-profile'));
  
        await waitFor(() => true);
  
        const profile = toJSON(component, 'v-profile', 'all');
  
        // TODO testing navigation to other profiles should
        // be moved to its own test instead
        expect(profile).toMatchSnapshot('Should Be Mika Profile');
  
        // activate interests popup view
        fireEvent.press(component.getAllByTestId('bn-interests')[1]);
  
        await waitFor(() => true);
  
        const popup = toJSON(component, 'v-popup', 'all');
  
        expect(popup).toMatchSnapshot();
  
        component.unmount();
      });
  
      describe('Romantically Popup', () =>
      {
        test('Romantically Unavailable', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User',
              nickname: 'User',
              info: {
                romantically: 'Closed',
                gender: 'Woman',
                speaks: [ 'English' ]
              },
              interests: [ 'A', 'B', 'C' ]
            } as TProfile,
            inbox: [
              {
                id: '0',
                displayName: 'Mika',
                createdAt: new Date(),
                updatedAt: new Date(),
                members: [
                  {
                    uuid: '0',
                    avatar: 0,
                    interests: [] as string[]
                  },
                  {
                    uuid: '1',
                    avatar: 1,
                    fullName: 'Mika',
                    nickname: 'Mika',
                    info: {
                      gender: 'Woman',
                      romantically: 'Closed',
                      speaks: [ 'English' ]
                    },
                    interests: [] as string[]
                  }
                ],
                messages: [] as InboxEntry['messages']
              }
            ] as InboxEntry[]
          });
    
          const component = render(<App/>);
    
          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));
    
          // snap the bottom sheet the top of the screen
          // by simulating pressing a chat from inbox
          fireEvent.press(component.getAllByTestId('bn-chat')[0]);
      
          await waitFor(() => true);
    
          // activate menu view
          fireEvent.press(component.getByTestId('bn-menu'));
    
          await waitFor(() => true);
    
          // activate profile view
          fireEvent.press(component.getByTestId('bn-chat-profile'));
    
          await waitFor(() => true);
    
          // activate interests popup view
          fireEvent.press(component.getAllByTestId('bn-romantic')[1]);
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot();
    
          component.unmount();
        });
      
        test('Romantically Available (Bare)', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User',
              nickname: 'User',
              info: {
                romantically: 'Closed',
                gender: 'Woman',
                speaks: [ 'English' ]
              },
              interests: [ 'A', 'B', 'C' ]
            } as TProfile,
            inbox: [
              {
                id: '0',
                displayName: 'Mika',
                createdAt: new Date(),
                updatedAt: new Date(),
                members: [
                  {
                    uuid: '0',
                    avatar: 0,
                    interests: [] as string[]
                  },
                  {
                    uuid: '1',
                    avatar: 1,
                    fullName: 'Mika',
                    nickname: 'Mika',
                    info: {
                      gender: 'Woman',
                      romantically: 'Open',
                      speaks: [ 'English' ]
                    },
                    interests: [] as string[]
                  }
                ],
                messages: [] as InboxEntry['messages']
              }
            ] as InboxEntry[]
          });
    
          const component = render(<App/>);
    
          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));
    
          // snap the bottom sheet the top of the screen
          // by simulating pressing a chat from inbox
          fireEvent.press(component.getAllByTestId('bn-chat')[0]);
      
          await waitFor(() => true);
    
          // activate menu view
          fireEvent.press(component.getByTestId('bn-menu'));
    
          await waitFor(() => true);
    
          // activate profile view
          fireEvent.press(component.getByTestId('bn-chat-profile'));
    
          await waitFor(() => true);
    
          // activate interests popup view
          fireEvent.press(component.getAllByTestId('bn-romantic')[1]);
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot();
    
          component.unmount();
        });
      
        test('Romantically Available (Minor)', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User',
              nickname: 'User',
              info: {
                romantically: 'Closed',
                gender: 'Woman',
                speaks: [ 'English' ]
              },
              interests: [ 'A', 'B', 'C' ]
            } as TProfile,
            inbox: [
              {
                id: '0',
                displayName: 'Mika',
                createdAt: new Date(),
                updatedAt: new Date(),
                members: [
                  {
                    uuid: '0',
                    avatar: 0,
                    interests: [] as string[]
                  },
                  {
                    uuid: '1',
                    avatar: 1,
                    fullName: 'Mika',
                    nickname: 'Mika',
                    info: {
                      gender: 'Woman',
                      romantically: 'Open',
                      speaks: [ 'English' ],
                      birthday: {
                        year: new Date().getFullYear() - 16,
                        month: new Date().getMonth(),
                        day: new Date().getDay()
                      }
                    },
                    interests: [] as string[]
                  }
                ],
                messages: [] as InboxEntry['messages']
              }
            ] as InboxEntry[]
          });
    
          const component = render(<App/>);
    
          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));
    
          // snap the bottom sheet the top of the screen
          // by simulating pressing a chat from inbox
          fireEvent.press(component.getAllByTestId('bn-chat')[0]);
      
          await waitFor(() => true);
    
          // activate menu view
          fireEvent.press(component.getByTestId('bn-menu'));
    
          await waitFor(() => true);
    
          // activate profile view
          fireEvent.press(component.getByTestId('bn-chat-profile'));
    
          await waitFor(() => true);
    
          // activate interests popup view
          fireEvent.press(component.getAllByTestId('bn-romantic')[1]);
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot();
    
          component.unmount();
        });
  
        test('Romantically Available (Full)', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User',
              nickname: 'User',
              info: {
                romantically: 'Closed',
                gender: 'Woman',
                speaks: [ 'English' ]
              },
              interests: [ 'A', 'B', 'C' ]
            } as TProfile,
            inbox: [
              {
                id: '0',
                displayName: 'Mika',
                createdAt: new Date(),
                updatedAt: new Date(),
                members: [
                  {
                    uuid: '0',
                    avatar: 0,
                    interests: [] as string[]
                  },
                  {
                    uuid: '1',
                    avatar: 1,
                    fullName: 'Mana',
                    nickname: 'Mana',
                    info: {
                      gender: 'Woman',
                      sexuality: 'None',
                      romantically: 'Open',
                      speaks: [ 'English' ],
                      birthday: {
                        year: new Date().getFullYear() - 21,
                        month: new Date().getMonth(),
                        day: new Date().getDay()
                      }
                    },
                    interests: [] as string[]
                  }
                ],
                messages: [] as InboxEntry['messages']
              }
            ] as InboxEntry[]
          });
    
          const component = render(<App/>);
    
          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));
    
          // snap the bottom sheet the top of the screen
          // by simulating pressing a chat from inbox
          fireEvent.press(component.getAllByTestId('bn-chat')[0]);
      
          await waitFor(() => true);
    
          // activate menu view
          fireEvent.press(component.getByTestId('bn-menu'));
    
          await waitFor(() => true);
    
          // activate profile view
          fireEvent.press(component.getByTestId('bn-chat-profile'));
    
          await waitFor(() => true);
    
          // activate interests popup view
          fireEvent.press(component.getAllByTestId('bn-romantic')[1]);
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot();
    
          component.unmount();
        });
      });
    });

    describe('Personal', () =>
    {
      describe('Edits', () =>
      {
        test('Bio', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User Using Used',
              nickname: 'User',
              bio: 'Test Bio',
              info: {
                romantically: 'Open',
                gender: 'Non-binary',
                speaks: [ 'English' ]
              },
              interests: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
            } as TProfile
          });

          const component = render(<App/>);

          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));

          // press menu
          fireEvent.press(component.getByTestId('bn-menu'));

          await waitFor(() => true);
    
          // press profile
          fireEvent.press(component.getByTestId('bn-profile'));
    
          await waitFor(() => true);
          
          const initial = toJSON(component, 'bn-bio', 'all');

          expect(initial).toMatchSnapshot('Bio Should Equal Test Bio');
            
          // activate popup view
          fireEvent.press(component.getByTestId('bn-bio'));
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot('Bio Edits Popup');

          fireEvent.changeText(component.getByTestId('in-bio'), 'I Love You, Skye.');

          fireEvent.press(component.getByTestId('bn-save'));

          await waitFor(() => true);

          const updated = toJSON(component, 'bn-bio', 'all');

          expect(updated).toMatchSnapshot('Bio Should Equal I Love You, Skye.');
    
          component.unmount();
        });

        test('Avatar', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User Using Used',
              nickname: 'User',
              bio: 'Test Bio',
              info: {
                romantically: 'Open',
                gender: 'Non-binary',
                speaks: [ 'English' ]
              },
              interests: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
            } as TProfile
          });

          const component = render(<App/>);

          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));

          // press menu
          fireEvent.press(component.getByTestId('bn-menu'));

          await waitFor(() => true);
    
          // press profile
          fireEvent.press(component.getByTestId('bn-profile'));
    
          await waitFor(() => true);
            
          // activate popup view
          fireEvent.press(component.getByTestId('bn-avatar'));
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot();
    
          component.unmount();
        });

        test('Titles', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User Using Used',
              nickname: 'User',
              bio: 'Test Bio',
              info: {
                romantically: 'Open',
                gender: 'Non-binary',
                speaks: [ 'English' ]
              },
              interests: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
            } as TProfile
          });

          const component = render(<App/>);

          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));

          // press menu
          fireEvent.press(component.getByTestId('bn-menu'));

          await waitFor(() => true);
    
          // press profile
          fireEvent.press(component.getByTestId('bn-profile'));
    
          await waitFor(() => true);
          
          const initial = toJSON(component, 'bn-titles', 'all');

          expect(initial).toMatchSnapshot('Initial Titles');
            
          // activate popup view
          fireEvent.press(component.getByTestId('bn-titles'));
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot('Titles Edits Popup');

          fireEvent.changeText(component.getByTestId('in-display'), 'Skye');
          fireEvent.changeText(component.getByTestId('in-nickname'), 'Skya');

          fireEvent.press(component.getByTestId('bn-save'));

          await waitFor(() => true);

          const updated = toJSON(component, 'bn-titles', 'all');

          expect(updated).toMatchSnapshot('Updated Titles');
    
          component.unmount();
        });

        test('Origin', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User Using Used',
              nickname: 'User',
              bio: 'Test Bio',
              info: {
                romantically: 'Open',
                gender: 'Non-binary',
                speaks: [ 'English' ],
                origin: 'United States'
              },
              interests: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
            } as TProfile
          });

          const component = render(<App/>);

          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));

          // press menu
          fireEvent.press(component.getByTestId('bn-menu'));

          await waitFor(() => true);
    
          // press profile
          fireEvent.press(component.getByTestId('bn-profile'));
    
          await waitFor(() => true);
          
          const initial = toJSON(component, 'bn-origin', 'all');

          expect(initial).toMatchSnapshot('Origin Should Equal United States');
            
          // activate popup view
          fireEvent.press(component.getByTestId('bn-origin'));
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot('Origin Edits Popup');

          fireEvent.press(component.getByTestId('sl-origin-value'));

          fireEvent.changeText(component.getByTestId('sl-origin-search'), 'Egypt');

          await waitFor(() => true);

          fireEvent.press(component.getByTestId('sl-origin-query'));

          fireEvent.press(component.getByTestId('bn-save'));

          await waitFor(() => true);

          const updated = toJSON(component, 'bn-origin', 'all');

          expect(updated).toMatchSnapshot('Origin Should Equal Egypt.');
    
          component.unmount();
        });
        
        test('Speaks', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User Using Used',
              nickname: 'User',
              bio: 'Test Bio',
              info: {
                romantically: 'Open',
                gender: 'Non-binary',
                speaks: [ 'English' ]
              },
              interests: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
            } as TProfile
          });

          const component = render(<App/>);

          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));

          // press menu
          fireEvent.press(component.getByTestId('bn-menu'));

          await waitFor(() => true);
    
          // press profile
          fireEvent.press(component.getByTestId('bn-profile'));
    
          await waitFor(() => true);
          
          const initial = toJSON(component, 'bn-speaks', 'all');

          expect(initial).toMatchSnapshot('Speaks Should Equal English');
            
          // activate popup view
          fireEvent.press(component.getByTestId('bn-speaks'));
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot('Speaks Edits Popup');

          fireEvent.press(component.getByTestId('sl-speaks-plus'));

          await waitFor(() => true);

          fireEvent.changeText(component.getByTestId('sl-speaks-search'), 'Arabic');

          await waitFor(() => true);

          fireEvent.press(component.getByTestId('sl-speaks-query'));

          fireEvent.press(component.getByTestId('bn-save'));

          await waitFor(() => true);

          const updated = toJSON(component, 'bn-speaks', 'all');

          expect(updated).toMatchSnapshot('Speaks Should Equal English, Arabic.');
    
          component.unmount();
        });
        
        test('Profession', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User Using Used',
              nickname: 'User',
              bio: 'Test Bio',
              info: {
                romantically: 'Open',
                gender: 'Non-binary',
                speaks: [ 'English' ],
                profession: 'Engineer'
              },
              interests: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
            } as TProfile
          });

          const component = render(<App/>);

          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));

          // press menu
          fireEvent.press(component.getByTestId('bn-menu'));

          await waitFor(() => true);
    
          // press profile
          fireEvent.press(component.getByTestId('bn-profile'));
    
          await waitFor(() => true);
          
          const initial = toJSON(component, 'bn-profession', 'all');

          expect(initial).toMatchSnapshot('Profession Should Equal Engineer');
            
          // activate popup view
          fireEvent.press(component.getByTestId('bn-profession'));
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot('Profession Edits Popup');

          fireEvent.changeText(component.getByTestId('in-profession'), 'Demon King');

          fireEvent.press(component.getByTestId('bn-save'));

          await waitFor(() => true);

          const updated = toJSON(component, 'bn-profession', 'all');

          expect(updated).toMatchSnapshot('Profession Should Equal Demon King');
    
          component.unmount();
        });

        test('Romantic', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User Using Used',
              nickname: 'User',
              bio: 'Test Bio',
              info: {
                romantically: 'Open',
                gender: 'Non-binary',
                speaks: [ 'English' ]
              },
              interests: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
            } as TProfile
          });

          const component = render(<App/>);

          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));

          // press menu
          fireEvent.press(component.getByTestId('bn-menu'));

          await waitFor(() => true);
    
          // press profile
          fireEvent.press(component.getByTestId('bn-profile'));
    
          await waitFor(() => true);
            
          const initial = toJSON(component, 'bn-romantic', 'all');

          expect(initial).toMatchSnapshot('Romantic Should Equal Open');

          // activate popup view
          fireEvent.press(component.getByTestId('bn-romantic'));
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot('Romantic Edits Popup');
    
          fireEvent(component.getByTestId('sw-romantic'), 'onValueChange', false);

          fireEvent.press(component.getByTestId('bn-save'));

          await waitFor(() => true);

          const updated = toJSON(component, 'bn-romantic', 'all');

          expect(updated).toMatchSnapshot('Romantic Should Equal Closed');

          component.unmount();
        });

        test('Works', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User Using Used',
              nickname: 'User',
              bio: 'Test Bio',
              info: {
                romantically: 'Open',
                gender: 'Non-binary',
                speaks: [ 'English' ],
                works: 'Not A Social Worker'
              },
              interests: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
            } as TProfile
          });

          const component = render(<App/>);

          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));

          // press menu
          fireEvent.press(component.getByTestId('bn-menu'));

          await waitFor(() => true);
    
          // press profile
          fireEvent.press(component.getByTestId('bn-profile'));
    
          await waitFor(() => true);
          
          const initial = toJSON(component, 'bn-works', 'all');

          expect(initial).toMatchSnapshot('Works Should Equal Not A Social Worker');
            
          // activate popup view
          fireEvent.press(component.getByTestId('bn-works'));
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot('Works Edits Popup');

          fireEvent.changeText(component.getByTestId('in-works'), 'Shadow Monarch');

          fireEvent.press(component.getByTestId('bn-save'));

          await waitFor(() => true);

          const updated = toJSON(component, 'bn-works', 'all');

          expect(updated).toMatchSnapshot('Works Should Equal Shadow Monarch');
    
          component.unmount();
        });

        test('Gender', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User Using Used',
              nickname: 'User',
              bio: 'Test Bio',
              info: {
                romantically: 'Open',
                gender: 'Non-binary',
                speaks: [ 'English' ]
              },
              interests: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
            } as TProfile
          });

          const component = render(<App/>);

          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));

          // press menu
          fireEvent.press(component.getByTestId('bn-menu'));

          await waitFor(() => true);
    
          // press profile
          fireEvent.press(component.getByTestId('bn-profile'));
    
          await waitFor(() => true);
          
          const initial = toJSON(component, 'bn-gender', 'all');

          expect(initial).toMatchSnapshot('Gender Should Equal Non-Binary');
            
          // activate popup view
          fireEvent.press(component.getByTestId('bn-gender'));
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot('Gender Edits Popup');

          fireEvent.press(component.getByTestId('sl-gender-value'));

          await waitFor(() => true);

          fireEvent.press(component.getAllByTestId('sl-gender-query')[0]);

          fireEvent.press(component.getByTestId('bn-save'));

          await waitFor(() => true);

          const updated = toJSON(component, 'bn-gender', 'all');

          expect(updated).toMatchSnapshot('Gender Should Equal Woman.');
    
          component.unmount();
        });

        test('Sexuality', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User Using Used',
              nickname: 'User',
              bio: 'Test Bio',
              info: {
                romantically: 'Open',
                gender: 'Woman',
                speaks: [ 'English' ],
                sexuality: 'None'
              },
              interests: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
            } as TProfile
          });

          const component = render(<App/>);

          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));

          // press menu
          fireEvent.press(component.getByTestId('bn-menu'));

          await waitFor(() => true);
    
          // press profile
          fireEvent.press(component.getByTestId('bn-profile'));
    
          await waitFor(() => true);
          
          const initial = toJSON(component, 'bn-sexuality', 'all');

          expect(initial).toMatchSnapshot('Sexuality Should Equal Asexual');
            
          // activate popup view
          fireEvent.press(component.getByTestId('bn-sexuality'));
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot('Sexuality Edits Popup');

          fireEvent.press(component.getByTestId('sl-sexuality-value'));

          await waitFor(() => true);

          fireEvent.press(component.getAllByTestId('sl-sexuality-query')[1]);

          fireEvent.press(component.getByTestId('bn-save'));

          await waitFor(() => true);

          const updated = toJSON(component, 'bn-sexuality', 'all');

          expect(updated).toMatchSnapshot('Sexuality Should Equal Lesbian.');
    
          component.unmount();
        });
        
        test('Religion', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User Using Used',
              nickname: 'User',
              bio: 'Test Bio',
              info: {
                romantically: 'Open',
                gender: 'Woman',
                speaks: [ 'English' ],
                religion: 'Christianity'
              },
              interests: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
            } as TProfile
          });

          const component = render(<App/>);

          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));

          // press menu
          fireEvent.press(component.getByTestId('bn-menu'));

          await waitFor(() => true);
    
          // press profile
          fireEvent.press(component.getByTestId('bn-profile'));
    
          await waitFor(() => true);
          
          const initial = toJSON(component, 'bn-religion', 'all');

          expect(initial).toMatchSnapshot('Religion Should Equal Christian');
            
          // activate popup view
          fireEvent.press(component.getByTestId('bn-religion'));
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot('Religion Edits Popup');

          fireEvent.press(component.getByTestId('sl-religion-value'));

          await waitFor(() => true);

          fireEvent.press(component.getAllByTestId('sl-religion-query')[1]);

          fireEvent.press(component.getByTestId('bn-save'));

          await waitFor(() => true);

          const updated = toJSON(component, 'bn-religion', 'all');

          expect(updated).toMatchSnapshot('Religion Should Equal Muslim.');
    
          component.unmount();
        });

        test('Age', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User Using Used',
              nickname: 'User',
              bio: 'Test Bio',
              info: {
                romantically: 'Open',
                gender: 'Non-binary',
                speaks: [ 'English' ],
                birthday: {
                  year: new Date().getFullYear() - 16,
                  month: 3,
                  day: 7
                }
              },
              interests: [ 'A', 'B', 'C', 'D', 'E', 'F' ]
            } as TProfile
          });

          const component = render(<App/>);

          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));

          // press menu
          fireEvent.press(component.getByTestId('bn-menu'));

          await waitFor(() => true);
    
          // press profile
          fireEvent.press(component.getByTestId('bn-profile'));
    
          await waitFor(() => true);
          
          const initial = toJSON(component, 'bn-age', 'all');

          expect(initial).toMatchSnapshot('Age Should Equal 16');
            
          // activate popup view
          fireEvent.press(component.getByTestId('bn-age'));
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot('Age Edits Popup');

          const yearPicker = component.getByTestId('pk-birthday-year');
          // const monthPicker = component.getByTestId('pk-birthday-month');
          // const dayPicker = component.getByTestId('pk-birthday-day');

          fireEvent.press(yearPicker.children[0] as ReactTestInstance);
          fireEvent.press(yearPicker.children[0] as ReactTestInstance);
          fireEvent.press(yearPicker.children[0] as ReactTestInstance);
          fireEvent.press(yearPicker.children[0] as ReactTestInstance);

          fireEvent.press(component.getByTestId('bn-save'));

          await waitFor(() => true);

          const updated = toJSON(component, 'bn-age', 'all');

          expect(updated).toMatchSnapshot('Age Should Equal 3');
    
          component.unmount();
        });

        test('Ice Breakers', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User Using Used',
              nickname: 'User',
              bio: 'Test Bio',
              info: {
                romantically: 'Open',
                gender: 'Non-binary',
                speaks: [ 'English' ]
              },
              iceBreakers: [ 'Beep-beeb?' ],
              interests: [ 'A', 'B', 'C' ]
            } as TProfile
          });

          const component = render(<App/>);

          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));

          // press menu
          fireEvent.press(component.getByTestId('bn-menu'));

          await waitFor(() => true);
    
          // press profile
          fireEvent.press(component.getByTestId('bn-profile'));
    
          await waitFor(() => true);
          
          const initial = toJSON(component, 'bn-ice-breakers', 'all');

          expect(initial).toMatchSnapshot('Ice Breakers Should Equal Beep-beeb?');
            
          // activate popup view
          fireEvent.press(component.getByTestId('bn-ice-breakers'));
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot('Ice Breakers Edits Popup');

          fireEvent.press(component.getByTestId('sl-ice-breakers-value'));

          await waitFor(() => true);

          fireEvent.press(component.getByTestId('sl-ice-breakers-plus'));

          await waitFor(() => true);

          fireEvent.changeText(component.getByTestId('sl-ice-breakers-input'), 'Who Murdered The Teddy Bear?');

          fireEvent(component.getByTestId('sl-ice-breakers-input'), 'onSubmitEditing');

          await waitFor(() => true);

          fireEvent.press(component.getByTestId('bn-save'));

          await waitFor(() => true);

          const updated = toJSON(component, 'bn-ice-breakers', 'all');

          expect(updated).toMatchSnapshot('Ice Breakers Should Equal Who Murdered The Teddy Bear?');
    
          component.unmount();
        });

        test('Interests', async() =>
        {
          getStore().set({
            profile: {
              uuid: '0',
              avatar: 0,
              fullName: 'User Using Used',
              nickname: 'User',
              bio: 'Test Bio',
              info: {
                romantically: 'Open',
                gender: 'Non-binary',
                speaks: [ 'English' ]
              },
              interests: [ 'A', 'B', 'C' ]
            } as TProfile
          });

          const component = render(<App/>);

          // wait for app loading
          await waitFor(() => component.getByTestId('v-main-area'));

          // press menu
          fireEvent.press(component.getByTestId('bn-menu'));

          await waitFor(() => true);
    
          // press profile
          fireEvent.press(component.getByTestId('bn-profile'));
    
          await waitFor(() => true);
          
          const initial = toJSON(component, 'bn-interests', 'all');

          expect(initial).toMatchSnapshot('Interests Should Equal A, B, C.');
            
          // activate popup view
          fireEvent.press(component.getByTestId('bn-interests'));
    
          await waitFor(() => true);
    
          const popup = toJSON(component, 'v-popup', 'all');
    
          expect(popup).toMatchSnapshot('Interests Edits Popup');

          fireEvent.press(component.getAllByTestId('sl-interests-value')[0]);
          fireEvent.press(component.getAllByTestId('sl-interests-value')[0]);
          fireEvent.press(component.getAllByTestId('sl-interests-value')[0]);

          await waitFor(() => true);

          fireEvent.press(component.getByTestId('sl-interests-plus'));

          await waitFor(() => true);

          fireEvent.changeText(component.getByTestId('sl-interests-search'), 'Anime');

          await waitFor(() => true);

          fireEvent.press(component.getByTestId('sl-interests-query'));

          fireEvent.press(component.getByTestId('bn-save'));

          await waitFor(() => true);

          const updated = toJSON(component, 'bn-interests', 'all');

          expect(updated).toMatchSnapshot('Interests Should Equal Anime.');
    
          component.unmount();
        });
      });
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
            avatar: 0,
            fullName: 'User',
            nickname: 'User',
            info: {
              romantically: 'Closed',
              gender: 'Woman',
              speaks: [ 'English' ]
            },
            interests: [ 'A', 'B', 'C' ]
          } as TProfile,
          inbox: [
            {
              id: '0',
              displayName: 'Mika',
              createdAt: new Date(1999, 9, 9, 9, 0),
              updatedAt: new Date(1999, 9, 9, 9, 1),
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1,
                  fullName: 'Mika',
                  nickname: 'Mika',
                  info: {
                    romantically: 'Closed',
                    gender: 'Woman',
                    speaks: [ 'English' ]
                  },
                  interests: [ 'A', 'B', 'C' ]
                }
              ],
              messages: [
                { owner: '1', text: 'Yay', createdAt: new Date(1999, 9, 9, 9, 0) },
                { owner: '0', text: '<3', createdAt: new Date(1999, 9, 9, 9, 1) }
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
            avatar: 0,
            fullName: 'User',
            nickname: 'User',
            info: {
              romantically: 'Closed',
              gender: 'Woman',
              speaks: [ 'English' ]
            },
            interests: [ 'A', 'B', 'C' ]
          } as TProfile,
          inbox: [
            {
              id: '0',
              displayName: 'Mika',
              createdAt: new Date(1999, 9, 9, 9, 0),
              updatedAt: new Date(),
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1,
                  fullName: 'Mika',
                  nickname: 'Mika',
                  info: {
                    romantically: 'Closed',
                    gender: 'Woman',
                    speaks: [ 'English' ]
                  },
                  interests: [ 'A', 'B', 'C' ]
                }
              ],
              messages: [
                { owner: '1', text: '1999', createdAt: new Date(1999, 9, 9, 9, 0) },
                { owner: '1', text: 'T-3 Days', createdAt: subDays(new Date(), 3) },
                { owner: '1', text: 'T-1 Day', createdAt: subDays(new Date(), 1) },
                { owner: '1', text: 'T-30 Minutes', createdAt: subMinutes(new Date(), 30) },
                { owner: '1', text: 'T-28 Minutes', createdAt: subMinutes(new Date(), 28) },
                { owner: '1', text: 'T-23 Minutes', createdAt: subMinutes(new Date(), 23) },
                { owner: '1', text: 'Now', createdAt: new Date() }
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
        
        expect(parent?.children?.[0]).toMatchSnapshot('Also Should Have A Timestamp');

        expect(parent?.children?.[1]).toMatchSnapshot('Old Enough To Have Its Own Timestamp');

        expect(parent?.children?.[2]).toMatchSnapshot('Shouldn\'t Have A Timestamp');

        expect(parent?.children?.[3]).toMatchSnapshot('Should Have A Timestamp of Today');
  
        expect(parent?.children?.[4]).toMatchSnapshot('Should Have A Timestamp of Yesterday');
        
        expect(parent?.children?.[5]).toMatchSnapshot('Should Have A Timestamp of This Week');
  
        expect(parent?.children?.[6]).toMatchSnapshot('Should Have A Timestamp of With The Year');
        
        component.unmount();
      });
      
      test('With Avatars', async() =>
      {
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0,
            fullName: 'User',
            nickname: 'User',
            info: {
              romantically: 'Closed',
              gender: 'Woman',
              speaks: [ 'English' ]
            },
            interests: [ 'A', 'B', 'C' ]
          } as TProfile,
          inbox: [
            {
              id: '0',
              displayName: 'Group of Wholesome Girls',
              createdAt: new Date(1999, 9, 9, 9, 0),
              updatedAt: new Date(1999, 9, 9, 9, 1),
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1,
                  fullName: 'Mika',
                  nickname: 'Mika',
                  info: {
                    romantically: 'Closed',
                    gender: 'Woman',
                    speaks: [ 'English' ]
                  },
                  interests: [ 'A', 'B', 'C' ]
                },
                {
                  uuid: '2',
                  avatar: 2,
                  fullName: 'Skye',
                  nickname: 'Skye',
                  info: {
                    romantically: 'Closed',
                    gender: 'Woman',
                    speaks: [ 'English' ]
                  },
                  interests: [ 'A', 'B', 'C' ] as string[]
                }
              ],
              messages: [
                { owner: '1', text: 'Yay', createdAt: new Date(1999, 9, 9, 9, 0) },
                { owner: '0', text: '<3', createdAt: new Date(1999, 9, 9, 9, 1) }
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

    describe('Hints', () =>
    {
      test('Bare', async() =>
      {
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0,
            fullName: 'User',
            nickname: 'User',
            info: {
              romantically: 'Closed',
              gender: 'Woman',
              speaks: [ 'English' ]
            },
            interests: [ 'A', 'B', 'C' ]
          } as TProfile,
          inbox: [
            {
              id: '0',
              displayName: 'Mika',
              createdAt: new Date(1999, 9, 9, 9),
              updatedAt: new Date(1999, 9, 9, 9),
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1,
                  fullName: 'Mika',
                  nickname: 'Mika',
                  info: {
                    gender: 'Woman',
                    romantically: 'Closed',
                    speaks: [ 'English' ]
                  },
                  interests: [ 'A', 'B', 'C' ] as string[]
                }
              ],
              messages: [] as InboxEntry['messages']
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
        
        // to make sure when props change
        expect(parent).toMatchSnapshot();

        component.unmount();
      });

      test('All', async() =>
      {
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0,
            fullName: 'User',
            nickname: 'User',
            info: {
              romantically: 'Closed',
              gender: 'Woman',
              speaks: [ 'English' ]
            },
            interests: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K' ]
          } as TProfile,
          inbox: [
            {
              id: '0',
              displayName: 'Mika',
              createdAt: new Date(1999, 9, 9, 9),
              updatedAt: new Date(1999, 9, 9, 9),
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1,
                  fullName: 'Mika',
                  nickname: 'Mika',
                  info: {
                    gender: 'Woman',
                    sexuality: 'Homosexual',
                    romantically: 'Closed',
                    speaks: [ 'English' ],
                    birthday: {
                      year: new Date().getFullYear() - 16,
                      month: new Date().getMonth(),
                      day: new Date().getDay()
                    },
                    origin: 'United States',
                    profession: 'Actor',
                    works: 'HSS'
                  },
                  iceBreakers: [
                    'Skye?',
                    'Ajay?'
                  ],
                  interests: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K' ] as string[]
                }
              ],
              messages: [] as InboxEntry['messages']
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
        
        // to make sure when props change
        expect(parent).toMatchSnapshot();

        component.unmount();
      });
      
      test('Romantically Open Woman Bare', async() =>
      {
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0,
            fullName: 'User',
            nickname: 'User',
            info: {
              romantically: 'Closed',
              gender: 'Woman',
              speaks: [ 'English' ]
            },
            interests: [ 'A', 'B', 'C' ]
          } as TProfile,
          inbox: [
            {
              id: '0',
              displayName: 'Mika',
              createdAt: new Date(1999, 9, 9, 9),
              updatedAt: new Date(1999, 9, 9, 9),
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1,
                  fullName: 'Mika',
                  nickname: 'Mika',
                  info: {
                    gender: 'Woman',
                    romantically: 'Open',
                    speaks: [ 'English' ]
                  },
                  interests: [] as string[]
                }
              ],
              messages: [] as InboxEntry['messages']
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
        
        // to make sure when props change
        expect(parent).toMatchSnapshot();

        component.unmount();
      });

      test('Romantically Open Man Bare', async() =>
      {
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0,
            fullName: 'User',
            nickname: 'User',
            info: {
              romantically: 'Closed',
              gender: 'Woman',
              speaks: [ 'English' ]
            },
            interests: [ 'A', 'B', 'C' ]
          } as TProfile,
          inbox: [
            {
              id: '0',
              displayName: 'Amir',
              createdAt: new Date(1999, 9, 9, 9),
              updatedAt: new Date(1999, 9, 9, 9),
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1,
                  fullName: 'Amir',
                  nickname: 'Amir',
                  info: {
                    gender: 'Man',
                    romantically: 'Open',
                    speaks: [ 'Arabic' ]
                  },
                  interests: [] as string[]
                }
              ],
              messages: [] as InboxEntry['messages']
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
        
        // to make sure when props change
        expect(parent).toMatchSnapshot();

        component.unmount();
      });

      test('Romantically Open Non-binary Bare', async() =>
      {
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0,
            fullName: 'User',
            nickname: 'User',
            info: {
              romantically: 'Closed',
              gender: 'Woman',
              speaks: [ 'English' ]
            },
            interests: [ 'A', 'B', 'C' ]
          } as TProfile,
          inbox: [
            {
              id: '0',
              displayName: 'Amir',
              createdAt: new Date(1999, 9, 9, 9),
              updatedAt: new Date(1999, 9, 9, 9),
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1,
                  fullName: 'Alex',
                  nickname: 'Alex',
                  info: {
                    gender: 'Non-binary',
                    romantically: 'Open',
                    speaks: [ 'English' ]
                  },
                  interests: [] as string[]
                }
              ],
              messages: [] as InboxEntry['messages']
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
        
        // to make sure when props change
        expect(parent).toMatchSnapshot();

        component.unmount();
      });

      test('Romantically Open Woman All', async() =>
      {
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0,
            fullName: 'User',
            nickname: 'User',
            info: {
              romantically: 'Closed',
              gender: 'Woman',
              speaks: [ 'English' ]
            },
            interests: [ 'A', 'B', 'C' ]
          } as TProfile,
          inbox: [
            {
              id: '0',
              displayName: 'Mika',
              createdAt: new Date(1999, 9, 9, 9),
              updatedAt: new Date(1999, 9, 9, 9),
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1,
                  fullName: 'Mika',
                  nickname: 'Mika',
                  info: {
                    gender: 'Woman',
                    sexuality: 'Homosexual',
                    romantically: 'Open',
                    birthday: {
                      year: new Date().getFullYear() - 18,
                      month: new Date().getMonth(),
                      day: new Date().getDay()
                    },
                    origin: 'United States',
                    speaks: [ 'English' ],
                    works: 'HSS',
                    profession: 'Actor'
                  },
                  interests: [] as string[]
                }
              ],
              messages: [] as InboxEntry['messages']
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
        
        // to make sure when props change
        expect(parent).toMatchSnapshot();

        component.unmount();
      });

      test('Romantically Open Man All', async() =>
      {
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0,
            fullName: 'User',
            nickname: 'User',
            info: {
              romantically: 'Closed',
              gender: 'Woman',
              speaks: [ 'English' ]
            },
            interests: [ 'A', 'B', 'C' ]
          } as TProfile,
          inbox: [
            {
              id: '0',
              displayName: 'Amir',
              createdAt: new Date(1999, 9, 9, 9),
              updatedAt: new Date(1999, 9, 9, 9),
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1,
                  fullName: 'Amir',
                  nickname: 'Amir',
                  info: {
                    gender: 'Man',
                    birthday: {
                      year: new Date().getFullYear() - 23,
                      month: new Date().getMonth(),
                      day: new Date().getDay()
                    },
                    origin: 'Egypt',
                    profession: 'Singer',
                    religion: 'Islam',
                    romantically: 'Open',
                    sexuality: 'Heterosexual',
                    works: 'Cairokee',
                    speaks: [ 'Arabic' ]
                  },
                  interests: [] as string[]
                }
              ],
              messages: [] as InboxEntry['messages']
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
        
        // to make sure when props change
        expect(parent).toMatchSnapshot();

        component.unmount();
      });

      test('Romantically Open Underage Non-binary All', async() =>
      {
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0,
            fullName: 'User',
            nickname: 'User',
            info: {
              romantically: 'Closed',
              gender: 'Woman',
              speaks: [ 'English' ]
            },
            interests: [ 'A', 'B', 'C' ]
          } as TProfile,
          inbox: [
            {
              id: '0',
              displayName: 'Amir',
              createdAt: new Date(1999, 9, 9, 9),
              updatedAt: new Date(1999, 9, 9, 9),
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1,
                  fullName: 'Alex',
                  nickname: 'Alex',
                  info: {
                    gender: 'Non-binary',
                    birthday: {
                      year: new Date().getFullYear() - 16,
                      month: new Date().getMonth(),
                      day: new Date().getDay()
                    },
                    origin: 'United States',
                    profession: 'Activist',
                    romantically: 'Open',
                    sexuality: 'None',
                    works: 'United Nations',
                    speaks: [ 'English' ]
                  },
                  interests: [] as string[]
                }
              ],
              messages: [] as InboxEntry['messages']
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
        
        // to make sure when props change
        expect(parent).toMatchSnapshot();

        component.unmount();
      });

      test('Group Bare', async() =>
      {
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0,
            fullName: 'User',
            nickname: 'User',
            info: {
              romantically: 'Closed',
              gender: 'Woman',
              speaks: [ 'English' ]
            },
            interests: [ 'A', 'B', 'C' ]
          } as TProfile,
          inbox: [
            {
              id: '0',
              displayName: 'Group of Wholesome Girls',
              createdAt: new Date(1999, 9, 9, 9),
              updatedAt: new Date(1999, 9, 9, 9),
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1,
                  fullName: 'Mika',
                  nickname: 'Mika',
                  info: {
                    gender: 'Woman',
                    romantically: 'Closed',
                    speaks: [ 'English' ]
                  },
                  interests: [] as string[]
                },
                {
                  uuid: '2',
                  avatar: 2,
                  fullName: 'Skye',
                  nickname: 'Skye',
                  info: {
                    gender: 'Woman',
                    romantically: 'Closed',
                    speaks: [ 'English' ]
                  },
                  interests: [] as string[]
                }
              ],
              messages: [] as InboxEntry['messages']
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
        
        // to make sure when props change
        expect(parent).toMatchSnapshot();

        component.unmount();
      });

      test('Group All', async() =>
      {
        getStore().set({
          profile: {
            uuid: '0',
            avatar: 0,
            fullName: 'User',
            nickname: 'User',
            info: {
              romantically: 'Closed',
              gender: 'Woman',
              speaks: [ 'English' ]
            },
            interests: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K' ]
          } as TProfile,
          inbox: [
            {
              id: '0',
              displayName: 'Group of Wholesome Girls',
              createdAt: new Date(1999, 9, 9, 9),
              updatedAt: new Date(1999, 9, 9, 9),
              members: [
                {
                  uuid: '0',
                  avatar: 0
                },
                {
                  uuid: '1',
                  avatar: 1,
                  fullName: 'Mika',
                  nickname: 'Mika',
                  info: {
                    gender: 'Woman',
                    sexuality: 'Homosexual',
                    romantically: 'Closed',
                    speaks: [ 'English' ],
                    birthday: {
                      year: new Date().getFullYear() - 16,
                      month: new Date().getMonth(),
                      day: new Date().getDay()
                    },
                    origin: 'United States',
                    profession: 'Actor',
                    works: 'HSS'
                  },
                  iceBreakers: [
                    'Skye?',
                    'Ajay?'
                  ],
                  interests: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K' ] as string[]
                },
                {
                  uuid: '2',
                  avatar: 2,
                  fullName: 'Skye',
                  nickname: 'Skye',
                  info: {
                    gender: 'Woman',
                    sexuality: 'Homosexual',
                    romantically: 'Closed',
                    speaks: [ 'English' ],
                    birthday: {
                      year: new Date().getFullYear() - 15,
                      month: new Date().getMonth(),
                      day: new Date().getDay()
                    },
                    origin: 'United States',
                    profession: 'Actor',
                    works: 'CA'
                  },
                  iceBreakers: [
                    'Mika?'
                  ],
                  interests: [ 'E', 'F', 'G', 'H', 'I', 'J', 'K' ] as string[]
                }
              ],
              messages: [] as InboxEntry['messages']
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
        
        // to make sure when props change
        expect(parent).toMatchSnapshot();

        component.unmount();
      });
    });

    test('Sending Messages', async() =>
    {
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile,
        inbox: [
          {
            id: '0',
            displayName: 'Mika',
            createdAt: subDays(new Date(), 2),
            updatedAt: subDays(new Date(), 2),
            members: [
              {
                uuid: '0',
                avatar: 0,
                interests: [] as string[]
              },
              {
                uuid: '1',
                avatar: 1,
                fullName: 'Mika',
                nickname: 'Mika',
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                interests: [] as string[]
              }
            ],
            messages: [
              { owner: '1', text: 'Yay', createdAt: subDays(new Date(), 2) }
            ]
          },
          {
            id: '1',
            displayName: 'Skye',
            createdAt: subDays(new Date(), 3),
            updatedAt: subDays(new Date(), 3),
            members: [
              {
                uuid: '0',
                avatar: 0,
                interests: [] as string[]
              },
              {
                uuid: '2',
                avatar: 2,
                fullName: 'Skye',
                nickname: 'Skye',
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                interests: [] as string[]
              }
            ],
            messages: [
              { owner: '1', text: 'Ya?', createdAt: subDays(new Date(), 3) }
            ]
          }
        ] as InboxEntry[]
      });
    
      const component = render(<App/>);
    
      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));
  
      // snap the bottom sheet the top of the screen
      // by simulating pressing a chat from inbox
      fireEvent.press(component.getAllByTestId('bn-chat')[1]);
  
      await waitFor(() => true);
  
      const initialHeader = toJSON(component, 'v-chat-header', 'all');
      
      const initialInbox= toJSON(component, 'v-inbox', 'all');
      
      const initialMessages = toJSON(component, 'v-messages', 'all');
      
      expect(initialHeader).toMatchSnapshot('Should Have A Normal Date');
      
      expect(initialInbox).toMatchSnapshot();

      expect(initialMessages?.children).toHaveLength(2);

      // typing message

      fireEvent.changeText(component.getByTestId('in-message'), '<3');
      
      const initialInput = toJSON(component, 'in-message', 'all');

      expect(initialInput).toMatchSnapshot('Typing Message');

      // send message

      fireEvent.press(component.getByTestId('bn-message'));

      await waitFor(() => true);
      
      const input = toJSON(component, 'in-message', 'all');

      expect(input).toMatchSnapshot('Sent Message');

      const header = toJSON(component, 'v-chat-header', 'all');
      
      const inbox = toJSON(component, 'v-inbox', 'all');

      const messages = toJSON(component, 'v-messages', 'all');
      
      expect(header).toMatchSnapshot('Should Have A Recently Active State');

      expect(inbox).toMatchSnapshot('Should Be Sorted With Skye on Top');
        
      expect(messages?.children).toHaveLength(3);

      expect(messages?.children?.[0]).toMatchSnapshot('Should Be A Message Equal to <3');
  
      component.unmount();
    });

    test('Sending Ice Breaker', async() =>
    {
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile,
        inbox: [
          {
            id: '0',
            displayName: 'Mika',
            createdAt: subDays(new Date(), 2),
            updatedAt: subDays(new Date(), 2),
            members: [
              {
                uuid: '0',
                avatar: 0,
                interests: [] as string[]
              },
              {
                uuid: '1',
                avatar: 1,
                fullName: 'Mika',
                nickname: 'Mika',
                iceBreakers: [
                  'What is your favorite food?',
                  'How much do you love Skye?'
                ],
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                interests: [] as string[]
              }
            ],
            messages: []
          }
        ] as InboxEntry[]
      });
    
      const component = render(<App/>);
    
      // wait for app loading
      await waitFor(() => component.getByTestId('v-main-area'));
  
      // snap the bottom sheet the top of the screen
      // by simulating pressing a chat from inbox
      fireEvent.press(component.getAllByTestId('bn-chat')[0]);
  
      await waitFor(() => true);
  
      const iceBreakers = toJSON(component, 'v-ice-breaker', 'all');
      
      const initialMessages = toJSON(component, 'v-messages', 'all');
      
      expect(initialMessages?.children).toHaveLength(1);
      
      expect(iceBreakers).toMatchSnapshot();

      // send message

      fireEvent.press(component.getAllByTestId('bn-ice-breaker')[1]);

      fireEvent.press(component.getByTestId('bn-message'));

      await waitFor(() => true);
      
      const messages = toJSON(component, 'v-messages', 'all');
      
      expect(messages?.children).toHaveLength(2);

      expect(messages?.children?.[0]).toMatchSnapshot();
  
      component.unmount();
    });

    test('Popup', async() =>
    {
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile,
        inbox: [
          {
            id: '0',
            displayName: 'Mika',
            createdAt: new Date(),
            updatedAt: new Date(),
            members: [
              {
                uuid: '0',
                avatar: 0
              },
              {
                uuid: '1',
                fullName: 'Mika',
                avatar: 1,
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                interests: [] as string[]
              }
            ],
            messages: [
              { owner: '1', text: 'Yay', createdAt: new Date() }
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
  
      const initialPopup = toJSON(component, 'v-popup', 'one');

      expect(initialPopup).toMatchSnapshot('Y-Axis should be equal to screen\'s hight');

      const message = component.getByTestId('v-messages').children[0] as ReactTestInstance;
      
      fireEvent.press(message.findByProps({ testID: 'bn-context' }));

      await waitFor(() => true);

      const full = toJSON(component, 'v-popup', 'one');

      expect(full).toMatchSnapshot('Y-Axis should be 0');

      // hide the main menu
      // by simulating pressing the hardware back button
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      BackHandler.mockPressBack();

      await waitFor(() => true);

      const closed = toJSON(component, 'v-popup', 'one');

      expect(closed).toMatchDiffSnapshot(initialPopup);

      component.unmount();
    });

    test('Chat Context', async() =>
    {
      getStore().set({
        profile: {
          uuid: '0',
          avatar: 0,
          fullName: 'User',
          nickname: 'User',
          info: {
            romantically: 'Closed',
            gender: 'Woman',
            speaks: [ 'English' ]
          },
          interests: [ 'A', 'B', 'C' ]
        } as TProfile,
        inbox: [
          {
            id: '0',
            displayName: 'Mika',
            createdAt: new Date(),
            updatedAt: new Date(),
            members: [
              {
                uuid: '0',
                avatar: 0
              },
              {
                uuid: '1',
                fullName: 'Mika',
                avatar: 1,
                info: {
                  romantically: 'Closed',
                  gender: 'Woman',
                  speaks: [ 'English' ]
                },
                interests: [] as string[]
              }
            ],
            messages: [
              { owner: '1', text: 'Yay', createdAt: new Date() }
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
  
      const message = component.getByTestId('v-messages').children[0] as ReactTestInstance;
      
      fireEvent.press(message.findByProps({ testID: 'bn-context' }));

      await waitFor(() => true);

      const context = toJSON(component, 'v-chat-context', 'all');

      expect(context).toMatchSnapshot();

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
      } as TProfile,
      inbox: [
        {
          id: '0',
          displayName: 'Mika',
          createdAt: new Date(1999, 9, 9, 9),
          updatedAt: new Date(1999, 9, 9, 9),
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
            { owner: '1', text: 'Yay', createdAt: new Date(1999, 9, 9, 9) }
          ]
        }
      ] as InboxEntry[]
    });
  
    const component = render(<Inbox/>);

    expect(component.toJSON()).toMatchSnapshot('Should Be A Normal Inbox View With 1 Avatar');

    component.unmount();
  });

  test('New Match View', () =>
  {
    getStore().set({
      profile: {
        uuid: '0',
        avatar: 0
      } as TProfile,
      inbox: [
        {
          id: '0',
          displayName: 'Mika',
          createdAt: new Date(1999, 9, 9, 9),
          updatedAt: new Date(1999, 9, 9, 9),
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
          messages: [] as InboxEntry['messages']
        }
      ] as InboxEntry[]
    });
  
    const component = render(<Inbox/>);

    expect(component.toJSON()).toMatchSnapshot('Should Be A New Match Inbox View');

    component.unmount();
  });

  test('Timestamps Formatting', () =>
  {
    getStore().set({
      profile: {
        uuid: '0',
        avatar: 0
      } as TProfile,
      inbox: [
        {
          id: '0',
          displayName: 'Mika',
          createdAt: new Date(),
          updatedAt: new Date(),
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
            { owner: '1', text: 'Yay', createdAt: new Date() }
          ]
        },
        {
          id: '1',
          displayName: 'Mika',
          createdAt: new Date(),
          updatedAt: subDays(new Date(), 1),
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
            { owner: '1', text: 'Yay', createdAt: subDays(new Date(), 1) }
          ]
        },
        {
          id: '2',
          displayName: 'Mika',
          createdAt: new Date(),
          updatedAt: subDays(new Date(), 3),
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
            { owner: '1', text: 'Yay', createdAt: subDays(new Date(), 3) }
          ]
        },
        {
          id: '3',
          displayName: 'Mika',
          createdAt: new Date(),
          updatedAt: new Date(1999, 9, 9, 9, 0),
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
            { owner: '1', text: 'Yay', createdAt: new Date(1999, 9, 9, 9, 0) }
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
      } as TProfile,
      inbox: [
        {
          id: '0',
          displayName: 'Group of Wholesome Girls',
          createdAt: new Date(1999, 9, 9),
          updatedAt: new Date(2001, 1, 1),
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
            { owner: '1', text: 'Yay', createdAt: new Date(1999, 9, 9) },
            { owner: '2', text: 'UwU', createdAt: new Date(2001, 1, 1) }
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
      } as TProfile,
      inbox: [
        {
          id: '0',
          displayName: 'Group of Wholesome Girls',
          createdAt: new Date(1999, 9, 9),
          updatedAt: new Date(2002, 2, 2),
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
            { owner: '1', text: 'Yay', createdAt: new Date(1999, 9, 9) },
            { owner: '2', text: 'UwU', createdAt: new Date(2001, 1, 1) },
            { owner: '3', text: '<3', createdAt: new Date(2002, 2, 2) }
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
      } as TProfile,
      inbox: [
        {
          id: '0',
          displayName: 'Group of Wholesome Girls',
          createdAt: new Date(1999, 9, 9),
          updatedAt: new Date(2003, 3, 3),
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
            { owner: '1', text: 'Yay', createdAt: new Date(1999, 9, 9) },
            { owner: '2', text: 'UwU', createdAt: new Date(2001, 1, 1) },
            { owner: '3', text: '<3', createdAt: new Date(2002, 2, 2) },
            { owner: '4', text: '^^', createdAt: new Date(2003, 3, 3) }
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
      } as TProfile,
      inbox: [
        {
          id: '0',
          displayName: 'Group of Wholesome Girls',
          createdAt: new Date(1999, 9, 9),
          updatedAt: new Date(2003, 3, 3),
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
            { owner: '1', text: 'Yay', createdAt: new Date(1999, 9, 9) },
            { owner: '2', text: 'UwU', createdAt: new Date(2001, 1, 1) },
            { owner: '3', text: '<3', createdAt: new Date(2002, 2, 2) },
            { owner: '4', text: '^^', createdAt: new Date(2003, 3, 3) }
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
      } as TProfile,
      inbox: [
        {
          id: '0',
          displayName: 'Group of Wholesome Girls',
          createdAt: new Date(1999, 9, 9),
          updatedAt: new Date(2003, 3, 3),
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
            { owner: '1', text: 'Yay', createdAt: new Date(1999, 9, 9) },
            { owner: '2', text: 'UwU', createdAt: new Date(2001, 1, 1) },
            { owner: '3', text: '<3', createdAt: new Date(2002, 2, 2) },
            { owner: '4', text: '^^', createdAt: new Date(2003, 3, 3) }
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

describe('Testing <Profile/>', () =>
{
  describe('Others', () =>
  {
    test('Bare Profile', () =>
    {
      const user = {
        uuid: '0',
        avatar: 0,
        fullName: 'User',
        nickname: 'User',
        interests: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K' ] as string[]
      } as TProfile;

      const profile = {
        uuid: '1',
        avatar: 1,
        fullName: 'Mika',
        nickname: 'Mika',
        info: {
          gender: 'Woman',
          romantically: 'Closed',
          speaks: [ 'English' ]
        },
        interests: [ '1', '2', '3' ] as string[]
      } as TProfile;
    
      const component = render(<Profile user={ user } profile={ profile }/>);
  
      expect(component.toJSON()).toMatchSnapshot();
  
      component.unmount();
    });

    test('Full Profile', () =>
    {
      const user = {
        uuid: '0',
        avatar: 0,
        fullName: 'User',
        nickname: 'User',
        interests: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K' ] as string[]
      } as TProfile;

      const profile = {
        uuid: '1',
        avatar: 1,
        fullName: 'Mika',
        nickname: 'Mika',
        bio: 'Leave My Skye Alone!',
        info: {
          gender: 'Woman',
          sexuality: 'Homosexual',
          romantically: 'Closed',
          speaks: [ 'English' ],
          birthday: {
            year: new Date().getFullYear() - 16,
            month: new Date().getMonth(),
            day: new Date().getDay()
          },
          origin: 'United States',
          profession: 'Actor',
          works: 'HSS'
        },
        iceBreakers: [
          'Skye?',
          'Ajay?'
        ],
        interests: [ 'A', 'B', 'C', 'D', 'E', 'F' ] as string[]
      } as TProfile;
    
      const component = render(<Profile user={ user } profile={ profile }/>);
  
      expect(component.toJSON()).toMatchSnapshot();
  
      component.unmount();
    });
  });

  describe('Personal', () =>
  {
    test('Bare Profile', () =>
    {
      const user = {
        uuid: '0',
        avatar: 0,
        fullName: 'User',
        nickname: 'User\'s Nickname',
        info: {
          gender: 'Non-binary',
          romantically: 'Open',
          speaks: [ 'English' ]
        },
        interests: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K' ] as string[]
      } as TProfile;

      const component = render(<Profile user={ user } profile={ user }/>);
  
      expect(component.toJSON()).toMatchSnapshot();
  
      component.unmount();
    });

    test('Full Profile', () =>
    {
      const user = {
        uuid: '0',
        avatar: 0,
        fullName: 'User',
        nickname: 'User\'s Nickname',
        bio: 'Skye is the only true Goddess.',
        info: {
          origin: 'United States',
          romantically: 'Open',
          speaks: [ 'English' ],
          profession: 'Cultist',
          works: 'Skyenet',
          gender: 'Non-binary',
          sexuality: 'Bisexual',
          birthday: {
            year: new Date().getFullYear() - 44,
            month: new Date().getMonth(),
            day: new Date().getDay()
          }
        },
        iceBreakers: [
          'Aren\'t you going overboard with this Skye joke?',
          'No.'
        ],
        interests: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K' ] as string[]
      } as TProfile;

      const component = render(<Profile user={ user } profile={ user }/>);
  
      expect(component.toJSON()).toMatchSnapshot();
  
      component.unmount();
    });
  });
});
