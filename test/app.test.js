/* eslint-disable security/detect-object-injection */
/* eslint-disable react/prop-types */

import React from 'react';

import { render, fireEvent, waitForElement } from 'react-native-testing-library';

import axios from 'axios';

import { createStore, getStore, deleteStore } from '../src/store.js';

import App from '../src/app.js';

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

    expect(initial).toMatchSnapshot('Initial (Inbox) View Should Be Visible');

    // switch to discover view
    // by simulating pressing the discover bottom navigation button
    fireEvent.press(component.getByTestId('bn-discover'));

    const discover = toJSON(component, 'v-navigation', 'one');

    expect(discover).toMatchSnapshot('Discover View Should Be Visible');

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

      expect(initial).toMatchSnapshot('Minimized Search bar');

      // maximize the search bar
      // by simulating pressing the search bar button
      fireEvent.press(component.getByTestId('bn-search-maximize'));

      const maximized = toJSON(component, 'v-search', 'one');

      expect(maximized).toMatchSnapshot('Maximized Search bar');

      // maximize the search bar
      // by simulating pressing the search bar button
      fireEvent.press(component.getByTestId('bn-search-minimize'));

      const minimized = toJSON(component, 'v-search', 'one');

      // initial should be the same as minimized
      expect(initial).toMatchDiffSnapshot(minimized);
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
    });

    test.todo('Search Bar Width (3 Avatars)');
  });
});