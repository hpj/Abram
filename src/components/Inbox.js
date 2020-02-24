import React from 'react';

import PropTypes from 'prop-types';

import { StyleSheet, View, TouchableOpacity } from 'react-native';

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

    // bind functions to use as callbacks

    this.onPress = this.onPress.bind(this);
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

  onPress()
  {
    this.props.bottomSheetSnapTo(1);
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
            // TODO maybe try android ripples
            return <TouchableOpacity
              key={ i }
              activeOpacity={ 0.75 }
              onPress={ this.onPress }
            >
              <View
                style={ {
                  ...styles.wrapper,
                  height: this.scale(129)
                } }
              >
                <View style={ styles.entry }>

                </View>
              </View>
            </TouchableOpacity>;
          })
        }
      </View>
    );
  }
}

Inbox.propTypes = {
  bottomSheetSnapTo: PropTypes.func
};

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

  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10
  },

  entry: {
    flex: 1,

    marginLeft: 20,
    marginRight: 20
  }
});

export default Inbox;
