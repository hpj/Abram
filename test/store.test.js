import Store, { createStore, getStore, deleteStore } from '../src/store.js';

describe('Testing Store', () =>
{
  test('Testing App Wide Stores', () =>
  {
    // creating a new store

    const store = createStore('test', {
      test: true
    });

    expect(store.state).toEqual({ test: true });

    // getting store by name

    expect(getStore('test')).toBeDefined();
    expect(getStore('test').state).toEqual({ test: true });

    // deleting store

    deleteStore('test');

    expect(getStore('test')).toBeUndefined();
  });

  test('Testing Mount', () =>
  {
    const store = new Store({ test: true });

    const component = {};
    
    store.mount(component);

    expect(component.state).toEqual({ test: true });
  });

  test('Testing Subscriptions', () =>
  {
    const store = new Store({ test: true });

    const component = {
      setState: (state) => component.state = state
    };
    
    expect(store.subscribe(component)).not.toBeFalse();

    expect(component.state).toEqual({ test: true });

    expect(store.unsubscribe(component)).toBeTrue();
  });

  test('Testing Unsubscribe', () =>
  {
    const store = new Store({ test: true });

    let component = {};
    
    expect(store.subscribe(component)).toBeFalse();

    component = {
      setState: () => component.state = {}
    };

    expect(store.subscribe(component)).not.toBeFalse();

    expect(store.unsubscribe(component)).toBeTrue();
    expect(store.unsubscribe(component)).toBeFalse();
  });

  test('Updating Store State', () =>
  {
    const store = new Store();

    const component = {
      setState: (state) => component.state = state
    };

    store.set({ test: true });
    
    expect(store.subscribe(component)).not.toBeFalse();

    // test initial state
    expect(component.state).toEqual({ test: true });

    // test adding a new key/value

    store.set({ more: true });

    expect(component.state).toEqual({ test: true, more: true });

    // test updating an existing key/value

    store.set({ test: 5 });

    expect(component.state).toEqual({ test: 5, more: true });

    expect(store.unsubscribe(component)).toBeTrue();
  });
});