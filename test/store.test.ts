/* eslint-disable @typescript-eslint/no-explicit-any */

import Store, { createStore, getStore } from '../src/store';

describe('Testing Store', () =>
{
  test('Testing App Wide Stores', () =>
  {
    // creating a new store

    const store = createStore({
      test: true
    });

    expect(store.state).toEqual({ test: true });

    // getting store by name

    expect(getStore()).toBeDefined();
    expect(getStore().state).toEqual({ test: true });
  });

  test('Testing Mount', () =>
  {
    const store = new Store({ test: true });

    const component = {
      state: {}
    };
    
    store.mount(component as React.Component);

    expect(component.state).toEqual({ test: true });
  });

  test('Testing Subscriptions', () =>
  {
    const store = new Store({ test: true });

    const component = {
      state: {},
      setState: (state: any) => component.state = state
    };
    
    expect(store.subscribe(component as React.Component)).toBeTruthy();

    expect(component.state).toEqual({ test: true });

    expect(store.unsubscribe(component as React.Component)).toBeTruthy();
  });

  test('Testing Unsubscribe', () =>
  {
    const store = new Store({ test: true });

    let component: any = {};
    
    expect(store.subscribe(component as React.Component)).toBeFalsy();

    component = {
      state: {},
      setState: () => component.state = {}
    };

    expect(store.subscribe(component as React.Component)).toBeTruthy();

    expect(store.subscribe(component as React.Component)).toBeFalsy();

    expect(store.unsubscribe(component as React.Component)).toBeTruthy();
    
    expect(store.unsubscribe(component as React.Component)).toBeFalsy();
  });

  test('Updating Store State', () =>
  {
    const store = new Store();

    const component = {
      state: {},
      setState: (state: any) => component.state = state
    };

    store.set({ test: true });
    
    expect(store.subscribe(component as React.Component)).toBeTruthy();

    // test initial state
    expect(component.state).toEqual({ test: true });

    // test adding a new key/value

    store.set({ more: true });

    expect(component.state).toEqual({ test: true, more: true });

    // test updating an existing key/value

    store.set({ test: 5 });

    expect(component.state).toEqual({ test: 5, more: true });

    expect(store.unsubscribe(component as React.Component)).toBeTruthy();
  });
});