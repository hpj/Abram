import React from 'react';

import { StyleSheet, StatusBar, SafeAreaView, View  } from 'react-native';

import NavigationView from './components/NavigationView.js';

import BottomNavigation from './components/BottomNavigation.js';

import { getStore } from './store.js';

import getTheme from './colors.js';

/**
* @type { import('../store.js').default }
*/
let store;

const colors = getTheme();

export default class App extends React.Component
{
  constructor()
  {
    super();

    // get store and subscribe to it

    store = getStore('app').mount(this);
  }

  componentDidMount()
  {
    store.subscribe(this);

    // set status-bar style

    StatusBar.setBackgroundColor(colors.whiteBackground);
    // StatusBar.setBarStyle((colors.theme === 'dark') ? 'light-content' : 'dark-content');
    StatusBar.setBarStyle('light-content');
  }

  componentWillUnmount()
  {
    store.unsubscribe(this);
  }

  render()
  {
    return (
      <SafeAreaView style={ styles.container }>

        <View style={ styles.views }>

          <NavigationView active={ (this.state.index === 0) } color='red'/>
          <NavigationView active={ (this.state.index === 1) } color='green'/>

        </View>

        <BottomNavigation/>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteBackground
  },

  views: {
    flex: 1
  }
});
