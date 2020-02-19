import React from 'react';

import { render, fireEvent } from 'react-native-testing-library';

import MockDate from 'mockdate';

import { createStore, deleteStore } from '../src/store.js';

import App from '../src/app.js';

beforeEach(() =>
{
  createStore('app', { index: 0 });

  // https://stackoverflow.com/a/51067606/10336604

  MockDate.set(0);

  jest.useFakeTimers();
});

afterEach(() =>
{
  deleteStore('app');
});

describe('<App/>', () =>
{
  test('Snapshot', () =>
  {
    const component = render(<App/>);
    
    expect(component.toJSON()).toMatchSnapshot();
  
    component.unmount();
  });

  test('Testing <BottomNavigation/>', () =>
  {
    const component = render(<App/>);

    // simulate pressing the discover navigation button
    fireEvent.press(component.getByTestId('bn-discover'));
    
    // finish the view transition animation
    global.timeTravel(150);
    
    expect(component.toJSON()).toMatchSnapshot();

    // simulate pressing the inbox navigation button
    fireEvent.press(component.getByTestId('bn-inbox'));

    // finish the view transition animation
    global.timeTravel(150);
    
    expect(component.toJSON()).toMatchSnapshot();
    
    component.unmount();
  });
});