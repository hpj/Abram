import React from 'react';

import PropTypes from 'prop-types';

import { StyleSheet, View } from 'react-native';

import Button from '../components/Button.js';

import { StoreComponent } from '../store.js';

import { sizes } from '../sizes';

import getTheme from '../colors.js';

const colors = getTheme();

class Inbox extends StoreComponent
{
  scale(size, standardHeight)
  {
    standardHeight = standardHeight || sizes.standardHeight;

    size = (size * this.state.size.height) / standardHeight;

    return Math.round(size);
  }

  onPress(entry)
  {
    this.store.set({ activeEntry: entry }, () => this.props.bottomSheetSnapTo(1));
  }

  render()
  {
    // TODO render real content based on state.inbox

    // TODO on press set a store state for active entry
    // then snap the bottom sheet

    return (
      <View style={ styles.container }>
        {
          this.state.inbox.map((entry, i) =>
          {
            return <Button
              key={ i }
              borderless={ false }
              onPress={ () => this.onPress(entry) }
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

  entry: {
    flex: 1,
    backgroundColor: 'green',
    
    marginLeft: 20,
    marginRight: 20
  }
});

export default Inbox;
