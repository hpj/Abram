import React from 'react';

import { StyleSheet, View, Alert } from 'react-native';

import Button from './Button.js';

import getTheme from '../colors.js';

const colors = getTheme();

class BottomNavigation extends React.Component
{
  render()
  {
    return (
      <View style={ styles.container }>
        <Button
          badgeStyle={ styles.badge }
          backgroundStyle={ styles.background }
          buttonStyle={ styles.entry }
          icon={ { name: 'inbox', size: 24, color: colors.whiteText  } }
          onPress={ () => Alert.alert('1') }
        />

        <Button
          backgroundStyle={ styles.backgroundInactive }
          buttonStyle={ styles.entry }
          icon={ { name: 'compass', size: 24, color: colors.inactiveWhiteText  } }
          onPress={ () => Alert.alert('2') }
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
    // maxWidth: 168,

    backgroundColor: colors.whiteBackground
  }
});

export default BottomNavigation;