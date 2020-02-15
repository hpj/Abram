import React, { Component } from 'react';

import { StyleSheet, View } from 'react-native';

import getTheme from '../colors.js';

const colors = getTheme();

class BottomNavigation extends Component
{
  render()
  {
    return (
      <View style={ styles.container }>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.red
  }
});

export default BottomNavigation;