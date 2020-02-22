import React from 'react';

import { StyleSheet, View } from 'react-native';

import Button from './Button.js';

import { getStore } from '../store.js';

import { sizes } from '../sizes';

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
          testID={ 'bn-inbox' }
          badgeStyle={ styles.badge }
          backgroundStyle={  (this.state.index === 0) ? styles.background : styles.backgroundInactive }
          buttonStyle={ styles.entry }
          icon={ { name: 'inbox', size: sizes.icon, color: (this.state.index === 0) ? colors.whiteText : colors.inactiveWhiteText } }
          onPress={ () => this.setIndex(0) }
        />

        <Button
          testID={ 'bn-discover' }
          backgroundStyle={  (this.state.index === 1) ? styles.background : styles.backgroundInactive }
          buttonStyle={ styles.entry }
          icon={ { name: 'compass', size: sizes.icon, color: (this.state.index === 1) ? colors.whiteText : colors.inactiveWhiteText } }
          onPress={ () => this.setIndex(1) }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: sizes.navigationBar,

    flexDirection: 'row',
    justifyContent: 'center',

    backgroundColor: colors.whiteBackground
  },

  badge: {
    backgroundColor: colors.whiteText,

    width: sizes.badge,
    height: sizes.badge,
    borderRadius: sizes.badge
  },

  background: {
    position: 'absolute',
    alignItems: 'flex-end',

    backgroundColor: colors.roundIconBackground,
    
    width: sizes.navigationBarButton,
    height: sizes.navigationBarButton,
    borderRadius: sizes.navigationBarButton
  },

  backgroundInactive: {
    position: 'absolute',
    alignItems: 'flex-end',

    backgroundColor: colors.roundIconBackgroundInactive,
    
    width: sizes.navigationBarButton,
    height: sizes.navigationBarButton,
    borderRadius: sizes.navigationBarButton
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