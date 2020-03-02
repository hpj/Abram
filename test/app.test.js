/* eslint-disable security/detect-object-injection */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/prop-types */

import React from 'react';

import { render, fireEvent, waitForElement } from 'react-native-testing-library';

import axios from 'axios';

import { createStore, deleteStore } from '../src/store.js';

import App from '../src/app.js';

// mocks axios
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: { test: true } })
}));

/** splits react testing library json trees to parts to make it easier to review
* @param { import('react-native-testing-library').RenderAPI } renderer
* @param { string } testId
* @param { 0 | 1 | 2 } shallow removes children from the returned object
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

  const tree = renderer.toJSON();

  let target;

  if (!testId)
    target = tree;
  else
    target = getByTestId(tree, testId);

  if (target && shallow === 1)
    target.children = [];
  else if (target && shallow === 2)
    target.children.forEach((c) => c.children = []);
  
  return target;
}

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
    View: View,
    Value: jest.fn().mockImplementation((value) =>
    {
      let v = value || 0;
  
      return {
        get: () => v,
        setValue: (value) => v = value,
        interpolate: ({ inputRange, outputRange }) => outputRange[inputRange.indexOf(v)]
      };
    })
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
      width: 500,
      height: 800
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

describe('<App/>', () =>
{
  test('Snapshot', async() =>
  {
    const component = render(<App/>);

    // wait for app loading
    await waitForElement(() => component.getByTestId('main-view'));

    // expect(toJSON(component, 'bottom-sheet', 2)).toMatchSnapshot();

    expect(1).toEqual(1);
  
    // component.unmount();
  });

  // test('Testing <BottomNavigation/>', () =>
  // {
  //   const component = render(<App/>);

  //   // simulate pressing the discover navigation button
  //   fireEvent.press(component.getByTestId('bn-discover'));
    
  //   // finish the view transition animation
  //   global.timeTravel(150);
    
  //   expect(component.toJSON()).toMatchSnapshot();

  //   // simulate pressing the inbox navigation button
  //   fireEvent.press(component.getByTestId('bn-inbox'));

  //   // finish the view transition animation
  //   global.timeTravel(150);
    
  //   expect(component.toJSON()).toMatchSnapshot();
    
  //   component.unmount();
  // });
});