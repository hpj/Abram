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
    this.subscriptions.push(component);

    component.setState(this.state);

    return this;
  }

  /**
  * @param { import('react').Component } component
  * @returns { Store }
  */
  unsubscribe(component)
  {
    const index = this.subscriptions.indexOf(component);

    if (index > -1)
      this.subscriptions.splice(index, 1);

    return this;
  }

  /**
  * @param { {} } state
  * @returns { Store }
  */
  set(state)
  {
    this.state = {
      ...this.state,
      ...state
    };

    // dispatch changes
    this.dispatch();

    return this;
  }

  /**
  * @returns { Store }
  */
  dispatch()
  {
    this.subscriptions.forEach((comp) =>
    {
      if (comp && comp.setState)
        comp.setState(this.state);
    });

    return this;
  }
}