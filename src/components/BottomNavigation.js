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
          buttonStyle={ styles.button }
          icon={ { name: 'inbox', size: 24, color: 'white'  } }
          onPress={ () => Alert.alert('1') }
        />

        <Button
          backgroundStyle={ styles.background }
          buttonStyle={ styles.button2 }
          icon={ { name: 'compass', size: 24, color: 'black'  } }
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

    backgroundColor: colors.red
  },

  badge: {
    backgroundColor: 'black',

    width: 12,
    height: 12,
    borderRadius: 12
  },

  background: {
    position: 'absolute',
    alignItems: 'flex-end',

    backgroundColor: 'orange',
    
    width: 46,
    height: 46,
    borderRadius: 46
  },

  button: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    minWidth: 80,
    maxWidth: 168,

    backgroundColor: 'green'
  },

  button2: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    minWidth: 80,
    maxWidth: 168,

    backgroundColor: 'yellow'
  },
});

export default BottomNavigation;