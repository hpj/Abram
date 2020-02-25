import React from 'react';

import PropTypes from 'prop-types';

import { StyleSheet, View } from 'react-native';

import Button from '../components/Button.js';

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
            return <Button
              key={ i }
              borderless={ false }
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
            </Button>;
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
    flex: 1
  },

  wrapper: {
    backgroundColor: 'purple',

    marginBottom: 20,
    marginTop: 25
  },

  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD'
  },

  entry: {
    flex: 1,
    backgroundColor: 'green',
    
    marginLeft: 20,
    marginRight: 20
  }
});

export default Inbox;
