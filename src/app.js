import React, { Component } from 'react';

import { StyleSheet, View } from 'react-native';

import BottomNavigation from './components/BottomNavigation.js';

import getTheme from './colors.js';

const colors = getTheme();

export default class App extends Component
{
  render()
  {
    return (
      <View style={ styles.container }>
        {/* <Text style={ styles.welcome }>Welcome to React Native</Text>
        <Text style={ styles.instructions }>To get started, edit App.js</Text>
        <Text style={ styles.instructions }>{instructions}</Text>

        <Button
          title="Press me"
          color="#f194ff"
          onPress={ () => Alert.alert('Button with adjusted color pressed') }
        /> */}

        <BottomNavigation/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.whiteBackground
  }
});
