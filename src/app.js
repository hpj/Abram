import React from 'react';

import { StyleSheet, StatusBar, SafeAreaView, View  } from 'react-native';

import { SplashScreen } from 'expo';

import NavigationView from './components/NavigationView.js';

import TopBar from './components/TopBar.js';
import BottomNavigation from './components/BottomNavigation.js';

import { load } from './loading.js';

import { getStore } from './store.js';

import getTheme from './colors.js';

/**
* @type { import('./store.js').default }
*/
let store;

const colors = getTheme();

export default class App extends React.Component
{
  constructor()
  {
    super();

    // get store
    store = getStore('app').mount(this);
  }

  componentDidMount()
  {
    SplashScreen.preventAutoHide();

    store.subscribe(this);

    // load resource and cache on app-start
    // crashes the app if loading encounters an error
    load((error) =>
    {
      // encountered an error during loading
      if (error)
      {
        throw new Error(error);
      }
      else
      {
        // set status-bar style
        StatusBar.setBackgroundColor(colors.whiteBackground);
        // StatusBar.setBarStyle((colors.theme === 'dark') ? 'light-content' : 'dark-content');
        StatusBar.setBarStyle('light-content');
  
        // hides the splash screen and shows the app
        SplashScreen.hide();
      }
    });
  }

  componentWillUnmount()
  {
    store.unsubscribe(this);
  }

  render()
  {
    return (
      <SafeAreaView style={ styles.container }>

        <TopBar/>

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
