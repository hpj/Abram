import React from 'react';

import { StyleSheet, StatusBar, SafeAreaView, View  } from 'react-native';

import { SplashScreen } from 'expo';

import Animated from 'react-native-reanimated';

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

const bottomSheetNode = new Animated.Value();

const bottomSheetRef = React.createRef();

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
    if (!this.state.loaded)
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
          // allow app UI to be rendered
          this.setState({ loaded: true }, () =>
          {
            this.setState({}, this.componentDidMount);
          });
  
          // set status-bar style
          StatusBar.setBackgroundColor(colors.whiteBackground);
          // StatusBar.setBarStyle((colors.theme === 'dark') ? 'light-content' : 'dark-content');
          StatusBar.setBarStyle('light-content');
    
          // hides the splash screen and shows the app
          SplashScreen.hide();
        }
      });
    }
    else
    {
      // fix the top bar margin being on reverse when the app starts
      bottomSheetNode.setValue(1);
    }
  }

  componentWillUnmount()
  {
    store.unsubscribe(this);
  }

  render()
  {
    if (!this.state.loaded)
      return <View/>;
  
    return (
      <SafeAreaView style={ styles.container }>

        <TopBar bottomSheetNode={ bottomSheetNode }/>

        <View style={ styles.views }>

          <NavigationView active={ (this.state.index === 0) }>
            <Inbox bottomSheetSnapTo={ bottomSheetRef.current?.snapTo }/>
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
            callbackNode={ bottomSheetNode }

            snapPoints = { [ 0, this.state.size.height ] }
            
            overdragResistanceFactor={ 0 }

            renderHeader = {
              () =>
                <View style={ styles.bottomSheetHeader }>
                  <View style={ styles.bottomSheetHandler }/>

                  <View style={ {
                    ...styles.bottomSheetHeaderContent,
                    width: this.state.size.width - (sizes.windowMargin * 2)
                  } }>
                    {/* <View/> */}
                  </View>
                </View>
            }

            renderContent = {
              () =>
                <View style={ {
                  ...styles.bottomSheetContent,
                  width: this.state.size.width,
                  height: this.state.size.height - (sizes.topBarHeight + sizes.bottomSheetHeaderHeight)
                } }>
                  {/* <View/> */}
                </View>
            }
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
    alignItems: 'center',
    backgroundColor: colors.whiteBackground,
    backgroundColor: 'green',

    height: sizes.topBarHeight + sizes.topBarBigMargin
  },

  bottomSheetHandler: {
    backgroundColor: colors.whiteText,

    width: 45,
    height: 5,

    marginTop: 10,
    borderRadius: 10
  },

  bottomSheetHeaderContent: {
    flex: 1,

    backgroundColor: 'brown',

    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin
  },

  bottomSheetContent: {
    backgroundColor: 'orange'
  }
});
