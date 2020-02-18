import React from 'react';
import renderer from 'react-test-renderer';

import { createStore } from '../src/store.js';

import App from '../src/app.js';

beforeEach(() =>
{
  createStore('app', { index: 0 });
});

describe('<App/>', () =>
{
  test('has 1 child', () =>
  {
    const tree = renderer.create(<App />).toJSON();
    
    expect(tree.children.length).toBe(2);
  });
});