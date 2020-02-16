import React from 'react';

import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';

import BottomNavigation from './components/BottomNavigation.js';

import getTheme from './colors.js';

const colors = getTheme();

export default class App extends React.Component
{
  componentDidMount()
  {
    // set status-bar style

    StatusBar.setBackgroundColor(colors.whiteBackground);
    StatusBar.setBarStyle((colors.theme === 'dark') ? 'light-content' : 'dark-content');
  }

  render()
  {
    return (
      <SafeAreaView style={ styles.container }>
        <BottomNavigation/>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteBackground
  }
});
