import React from 'react';

const stores = {};

/**
* @param { string } name
* @param { {} } state
* @returns { Store }
*/
export function createStore(name, state)
{
  // eslint-disable-next-line security/detect-object-injection
  return (stores[name] = new Store(state));
}

/**
* @param { string } name
* @returns { Store }
*/
export function getStore(name)
{
  // eslint-disable-next-line security/detect-object-injection
  return stores[name];
}

/**
* @param { string } name
*/
export function deleteStore(name)
{
  // eslint-disable-next-line security/detect-object-injection
  delete stores[name];
}

export class StoreComponent extends React.Component
{
  constructor(name, state)
  {
    super();
    
    // get store
    this.store = getStore((typeof name === 'string') ? name : 'app');

    this.state = {
      ...state,
      ...this.store.state
    };
  }

  componentDidMount()
  {
    this.store.subscribe(this);
  }

  componentWillUnmount()
  {
    this.store.unsubscribe(this);
  }
}

export default class Store
{
  /**
  * @param { {} } state
  */
  constructor(state)
  {
    this.subscriptions = [];
    this.state = state || {};
  }

  /**
  * @param { import('react').Component } component
  * @returns { Store }
  */
  mount(component)
  {
    component.state = this.state;

    return this;
  }

  /**
  * @param { import('react').Component } component
  * @returns { Store }
  */
  subscribe(component)
  {
    if (component && component.setState && this.subscriptions.indexOf(component) < 0)
    {
      this.subscriptions.push(component);

      component.setState(this.state);

      return this;
    }

    return false;
  }

  /**
  * @param { import('react').Component } component
  * @returns { boolean }
  */
  unsubscribe(component)
  {
    const index = this.subscriptions.indexOf(component);

    if (index > -1)
    {
      this.subscriptions.splice(index, 1);

      return true;
    }

    return false;
  }

  /**
  * @param { {} } state
  * @param { () => void } callback
  * @returns { Store }
  */
  set(state, callback)
  {
    this.state = {
      ...this.state,
      ...state
    };

    // dispatch changes
    this.dispatch().then(callback);

    return this;
  }

  /**
  * @returns { Promise }
  */
  dispatch()
  {
    return new Promise((resolve) =>
    {
      const promises = [];

      this.subscriptions.forEach((component) =>
      {
        if (component && component.setState)
        {
          promises.push(new Promise((resolve) => component.setState(this.state, resolve)));
        }
      });

      Promise.all(promises).then(resolve);
    });
  }
}