/* eslint-disable security/detect-object-injection */
/* eslint-disable react/prop-types */

import React from 'react';

import { render, fireEvent, waitForElement } from 'react-native-testing-library';

import axios from 'axios';

import { createStore, getStore, deleteStore } from '../src/store.js';

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

// mock react native bottom sheet
jest.mock('reanimated-bottom-sheet', () =>
{
  const { Component } = require('react');
  const { View } = require('react-native');

  class BottomSheet extends Component
  {
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

      // update index
      this.index = index;

      // update callbackNode value
      if (this.props.callbackNode)
        this.props.callbackNode.setValue(index);
      
      // change top based on snap point
      this.forceUpdate();
    }

    render()
    {
      const index = this.index || 0;

      return <View style={ { top: this.props.snapPoints[index] } }>
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
            callback({ finished: true });
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

beforeEach(() =>
{
  axios.get.mockReset();
  
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
});

describe('Testing <App/>', () =>
{
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

    // TODO need to activate bottom sheet before it can be tested correctly
    test.skip('Search Bar Width (2 Avatars)', async() =>
    {
      getStore('app').set({
        activeChat: {
          members: [ 'Mana' ],
          avatars: {
            'Mana': 1,
            'Mika': 2
          }
        }
      });

      const component = render(<App/>);

      // wait for app loading
      await waitForElement(() => component.getByTestId('v-main-area'));

      const initial = toJSON(component, 'v-search', 'one');

      console.log(initial);
      
      // expect(initial).toMatchSnapshot('Minimized Search bar');

      // maximize the search bar
      // by simulating pressing the search bar button
      fireEvent.press(component.getByTestId('bn-search-maximize'));

      const maximized = toJSON(component, 'v-search', 'one');

      console.log(maximized);

      // expect(maximized).toMatchSnapshot('Maximized Search bar');

      // maximize the search bar
      // by simulating pressing the search bar button
      fireEvent.press(component.getByTestId('bn-search-minimize'));

      const minimized = toJSON(component, 'v-search', 'one');

      expect(1).toEqual(1);

      // initial should be the same as minimized
      // expect(initial).toMatchDiffSnapshot(minimized);

      component.unmount();
    });

    test.todo('Search Bar Width (3 Avatars)');
  });

  describe('Main Menu', () =>
  {
    test('Showing and Hiding Menu', async() =>
    {
      const component = render(<App/>);

      // wait for app loading
      await waitForElement(() => component.getByTestId('v-main-area'));

      const initialMenu = toJSON(component, 'v-menu', 'one');
      const initialHolder = toJSON(component, 'v-holder', 'none');

      expect(initialMenu).toMatchSnapshot('Initial Menu View Should Be Hidden');
      expect(initialHolder).toMatchSnapshot('Initial Holder View Should Be Hidden & Disabled');
  
      // show the main menu
      // by simulating pressing the menu button
      fireEvent.press(component.getByTestId('bn-menu'));

      const activeMenu = toJSON(component, 'v-menu', 'one');
      const activeHolder = toJSON(component, 'v-holder', 'none');

      expect(activeMenu).toMatchSnapshot('Menu View Should Be Visible');
      expect(activeHolder).toMatchSnapshot('Holder View Should Be Visible & Enabled');
  
      // hide the main menu
      // by simulating pressing the menu button
      fireEvent.press(component.getByTestId('bn-menu'));

      const hiddenMenu = toJSON(component, 'v-menu', 'one');
      const hiddenHolder = toJSON(component, 'v-holder', 'none');

      // initial should be the same as hidden
      expect(initialMenu).toMatchDiffSnapshot(hiddenMenu);
      expect(initialHolder).toMatchDiffSnapshot(hiddenHolder);

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