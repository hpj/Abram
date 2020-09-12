/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable security/detect-object-injection */

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
}

export default class Store
{
  constructor(state?: object)
  {
    this.state = state ?? {};
  }
  
  subscriptions: React.Component[] = []

  state: object

  mount(component: React.Component): Store
  {
    component.state = this.state;

    return this;
  }

  subscribe(component: React.Component): Store | undefined
  {
    if (component?.setState && this.subscriptions.indexOf(component) < 0)
    {
      this.subscriptions.push(component);

      component.setState(this.state);

      return this;
    }
  }

  unsubscribe(component: React.Component): boolean | undefined
  {
    const index = this.subscriptions.indexOf(component);

    if (index > -1)
    {
      this.subscriptions.splice(index, 1);

      return true;
    }
  }

  set(state: object, callback?: () => void): Store
  {
    this.state = {
      ...this.state,
      ...state
    };

    // dispatch changes
    this.dispatch().then(callback);

    return this;
  }

  async dispatch(): Promise<void>
  {
    const promises: Promise<void>[] = [];

    this.subscriptions.forEach((component) =>
    {
      promises.push(new Promise((resolve) => component?.setState?.(this.state, resolve)));
    });

    await Promise.all(promises);
  }
}