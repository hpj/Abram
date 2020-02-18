import React from 'react';

import { StyleSheet, View } from 'react-native';

import Button from './Button.js';

import { getStore } from '../store.js';

import getTheme from '../colors.js';

/**
* @type { import('../store.js').default }
*/
let store;

const colors = getTheme();

class BottomNavigation extends React.Component
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

  setIndex(value)
  {
    store.set({
      index: value
    });
  }

  render()
  {
    return (
      <View style={ styles.container }>
        <Button
          badgeStyle={ styles.badge }
          backgroundStyle={ styles.background }
          buttonStyle={ styles.entry }
          icon={ { name: 'inbox', size: 24, color: colors.whiteText  } }
          onPress={ () => this.setIndex(0) }
        />

        <Button
          backgroundStyle={ styles.backgroundInactive }
          buttonStyle={ styles.entry }
          icon={ { name: 'compass', size: 24, color: colors.inactiveWhiteText  } }
          onPress={ () => this.setIndex(1) }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 56,

    flexDirection: 'row',
    justifyContent: 'center',

    backgroundColor: colors.whiteBackground
  },

  badge: {
    backgroundColor: colors.whiteText,

    width: 12,
    height: 12,
    borderRadius: 12
  },

  background: {
    position: 'absolute',
    alignItems: 'flex-end',

    backgroundColor: colors.bottomNavigationBackground,
    
    width: 44,
    height: 44,
    borderRadius: 44
  },

  backgroundInactive: {
    position: 'absolute',
    alignItems: 'flex-end',

    backgroundColor: colors.bottomNavigationBackgroundInactive,
    
    width: 44,
    height: 44,
    borderRadius: 44
  },

  entry: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    minWidth: 80,
    maxWidth: 168
  }
});

export default BottomNavigation;