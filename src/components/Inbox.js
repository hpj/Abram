import React from 'react';

import { StyleSheet, View } from 'react-native';

import { getStore } from '../store.js';

import { sizes } from '../sizes';

import getTheme from '../colors.js';

/**
* @type { import('../store.js').default }
*/
let store;

const colors = getTheme();

class Inbox extends React.Component
{
  constructor()
  {
    super();

    // get store
    store = getStore('app').mount(this);
  }

  componentDidMount()
  {
    store.subscribe(this);
  }

  componentWillUnmount()
  {
    store.unsubscribe(this);
  }

  scale(size, standardHeight)
  {
    standardHeight = standardHeight || sizes.standardHeight;

    size = (size * this.state.size.height) / standardHeight;

    return Math.round(size);
  }

  render()
  {
    const people = [
      {
        name: 'Dina'
      },
      {
        name: 'Council'
      },
      {
        name: 'Sisi'
      }
    ];

    return (
      <View style={ styles.container }>
        {
          people.map((entry, i) =>
          {
            return <View
              key={ i }
              style={ {
                ...styles.wrapper,
                height: this.scale(129)
              } }
            >
              <View style={ styles.entry }>

              </View>
            </View>;
          })
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red'
  },

  wrapper: {
    backgroundColor: 'purple',

    marginBottom: 20,
    marginTop: 25
  },

  entry: {
    flex: 1,
    backgroundColor: 'brown',

    marginLeft: 20,
    marginRight: 20
  }
});

export default Inbox;
