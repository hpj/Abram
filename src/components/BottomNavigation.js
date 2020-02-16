import React from 'react';

import { StyleSheet, View, Alert } from 'react-native';

import NavigationView from './NavigationView.js';

import Button from './Button.js';

import getTheme from '../colors.js';

const colors = getTheme();

class BottomNavigation extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      index: 0
    };

    this.setIndex = this.setIndex.bind(this);
  }

  setIndex(value)
  {
    this.setState({
      index: value
    });
  }

  getView()
  {
    if (this.state.index === 0)
      return <View style={ styles.test }/>;
    else
      return <View style={ styles.test2 }/>;
  }

  render()
  {
    return (
      <View style={ styles.wrapper }>

        <View style={ styles.views }>

          <NavigationView active={ (this.state.index === 0) } color='red'/>
          <NavigationView active={ (this.state.index === 1) } color='green'/>

        </View>

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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end'
  },

  views: {
    flex: 1
  },

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
    // maxWidth: 168,

    backgroundColor: colors.whiteBackground
  }
});

export default BottomNavigation;