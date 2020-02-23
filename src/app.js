import React from 'react';

import { StyleSheet, StatusBar, SafeAreaView, View  } from 'react-native';

import { SplashScreen } from 'expo';

import BottomSheet from 'reanimated-bottom-sheet';

import NavigationView from './components/NavigationView.js';

import TopBar from './components/TopBar.js';
import BottomNavigation from './components/BottomNavigation.js';

import Inbox from './components/Inbox.js';
import Discover from './components/Discover.js';

import { load } from './loading.js';

import { getStore } from './store.js';

import { sizes } from './sizes.js';

import getTheme from './colors.js';

/**
* @type { import('./store.js').default }
*/
let store;

const colors = getTheme();

let bottomSheetRef;

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
        // allow UI to be rendered
        store.set({ loaded: true });

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
    if (!this.state.loaded)
    {
      return <View/>;
    }
    else if (!bottomSheetRef)
    {
      bottomSheetRef = React.createRef();

      // workaround: force a re-render to send
      // bottomSheetRef to children
      setTimeout(() => this.setState({}));
    }
    
    return (
      <SafeAreaView style={ styles.container }>

        <TopBar/>

        <View style={ styles.views }>

          <NavigationView active={ (this.state.index === 0) }>
            <Inbox bottomSheetSnapTp={ bottomSheetRef?.current?.snapTo }/>
          </NavigationView>

          <NavigationView active={ (this.state.index === 1) }>
            <Discover/>
          </NavigationView>

        </View>

        <BottomNavigation/>

        <View style={ {
          ...styles.bottomSheet,
          width: this.state.size.width,
          height: this.state.size.height
        } }
        pointerEvents={ 'box-none' }
        >
          <BottomSheet
            ref={ bottomSheetRef }
            snapPoints = { [ this.state.size.height, 0 ] }
            initialSnap={ 1 }
            overdragResistanceFactor={ 0 }
            // eslint-disable-next-line react-native/no-inline-styles
            renderHeader = { () => <View style={ {
              ...styles.bottomSheetHeader,
              width: this.state.size.width
            } }>
              <View style={ styles.bottomSheetHandler }/>
            </View> }
            // eslint-disable-next-line react-native/no-inline-styles
            renderContent = { () => <View style={ {
              ...styles.bottomSheetContent,
              width: this.state.size.width,
              height: this.state.size.height - (sizes.topBarHeight + sizes.bottomSheetHeaderHeight)
            } }/> }
          />
        </View>

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
  },

  bottomSheet: {
    zIndex: 2,
    position: 'absolute'
  },

  bottomSheetHeader: {
    backgroundColor: colors.whiteBackground,

    alignItems: 'center',
    height: sizes.topBarHeight + sizes.bottomSheetHeaderHeight
  },

  bottomSheetHandler: {
    backgroundColor: colors.whiteText,

    width: 45,
    height: sizes.bottomSheetHeaderHeight,

    marginTop: 10,
    borderRadius: 10
  },

  bottomSheetContent: {
    backgroundColor: 'orange'
  }
});
