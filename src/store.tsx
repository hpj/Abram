/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';

let store: Store;

export function createStore(state: object): Store
{
  store = new Store(state);

  return store;
}

export function getStore(): Store
{
  return store;
}

export class StoreComponent<Props = {}, State = {}> extends React.Component<Props, State>
{
  constructor(state?: object)
  {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    super();
    
    // get store
    this.store = getStore();

    this.state = {
      ...state,
      ...this.store.state
    } as State;
  }

  store: Store;
  state: State;

  componentDidMount(): void
  {
    this.store.subscribe(this);
  }

  componentWillUnmount(): void
  {
    this.store.unsubscribe(this);
  }

  /** Emits before the state changes,
  * allows modification to the state before it's dispatched
  */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stateWillChange(newState: State): Partial<State> | void
  {
    //
  }

  /** Whitelist what changes are allowed to be dispatched to this component,
  * Improving performance (this is recommended, specially on large apps),
  * Not overriding this function will allow the component to receive any and all dispatches
  */
  // istanbul ignore next
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stateWhitelist(changes: Partial<State>): boolean
  {
    return true;
  }

  /** Emits every time a new state gets dispatched
  */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stateDidChange(state: State, changes: Partial<State>, old: State): void
  {
    //
  }
}

export default class Store
{
  constructor(state?: object)
  {
    this.state = state ?? {};

    this.changes = {};
  }
  
  subscriptions: StoreComponent[] = []

  state: any

  changes: any

  mount(component: React.Component): Store
  {
    component.state = this.state;

    return this;
  }

  subscribe(component: React.Component): Store | undefined
  {
    if (component?.setState && this.subscriptions.indexOf(component as StoreComponent) < 0)
    {
      this.subscriptions.push(component as StoreComponent);

      component.setState(this.state);

      return this;
    }
  }

  unsubscribe(component: React.Component): boolean | undefined
  {
    const index = this.subscriptions.indexOf(component as StoreComponent);

    if (index > -1)
    {
      this.subscriptions.splice(index, 1);

      return true;
    }
  }

  set(state: object, callback?: () => void): Store
  {
    const keys = Object.keys(state);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    keys.forEach((key) => this.changes[key] = this.state[key] = state[key]);

    // this.changes = {
    //   ...this.changes,
    //   ...state
    // };

    // this.state = {
    //   ...this.state,
    //   ...state
    // };

    // dispatch changes
    this.dispatch().then(callback);

    return this;
  }

  async dispatch(): Promise<void>
  {
    /** transform all values of the new state to true
    */
    const booleanify = (obj: any): any =>
    {
      const out = {} as any;

      const keys = Object.keys(obj);

      keys.forEach(key => out[key] = true);

      // keys.forEach((key) =>
      // {
      //   if (!Array.isArray(obj[key]) && typeof obj[key] === 'object')
      //     out[key] = booleanify(obj[key]);
      //   else
      //     out[key] = true;
      // });

      return out;
    };
    
    const promises: Promise<void>[] = [];

    const changesFingerprint = booleanify(this.changes);

    this.subscriptions.forEach((component) =>
    {
      // callback to notify components when they state will change
      const modified = component.stateWillChange?.call(component, this.state);

      if (modified)
      {
        const keys = Object.keys(modified);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        keys.forEach(key => this.state[key] = modified[key]);

        // this.state = {
        //   ...this.state,
        //   ...modified
        // };
      }
    });

    this.subscriptions.forEach((component) =>
    {
      if (
        typeof component.stateWhitelist === 'function' &&
        component.stateWhitelist.call(component, changesFingerprint) !== true
      )
        return;
      
      const old = { ...component.state };

      promises.push(new Promise((resolve) =>
      {
        component.setState(this.state, () =>
        {
          component.stateDidChange?.call(component, this.state, this.changes, old);
          
          resolve();
        });
      }));
    });

    this.changes = {};

    await Promise.all(promises);
  }
}