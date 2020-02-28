import React from 'react';

import { StyleSheet, StatusBar, SafeAreaView, View, TouchableWithoutFeedback  } from 'react-native';

import { SplashScreen } from 'expo';

import Animated from 'react-native-reanimated';

import BottomSheet from 'reanimated-bottom-sheet';

import NavigationView from './components/NavigationView.js';

import TopBar from './components/TopBar.js';
import BottomNavigation from './components/BottomNavigation.js';

import Inbox from './screens/Inbox.js';
import Discover from './screens/Discover.js';

import ChatHeader from './screens/ChatHeader.js';
import Chat from './screens/Chat.js';

import { load } from './loading.js';

import { StoreComponent } from './store.js';

import { screen, sizes } from './sizes.js';

import { depth } from './depth.js';

import getTheme from './colors.js';

const colors = getTheme();

const bottomSheetNode = new Animated.Value();

const holderNode = new Animated.Value(0);

const bottomSheetRef = React.createRef();

export default class App extends StoreComponent
{
  componentDidMount()
  {
    super.componentDidMount();

    if (!this.state.loaded)
    {
      SplashScreen.preventAutoHide();
  
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
            this.forceUpdate(this.componentDidMount);
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

  render()
  {
    if (!this.state.loaded)
      return <View/>;
  
    const holderOpacity = holderNode.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 0, 0.75 ]
    });

    return (
      <SafeAreaView style={ styles.container }>

        <TopBar holderNode={ holderNode } bottomSheetNode={ bottomSheetNode }/>

        <View style={ styles.views }>

          <NavigationView active={ (this.state.index === 0) }>
            <Inbox bottomSheetSnapTo={ bottomSheetRef.current?.snapTo }/>
          </NavigationView>

          <NavigationView active={ (this.state.index === 1) }>
            <Discover/>
          </NavigationView>

        </View>

        <TouchableWithoutFeedback>
          <Animated.View style={ {
            ...styles.holder,

            opacity: holderOpacity
          } }
          pointerEvents={ (this.state.holder) ? 'box-only' : 'none' }/>
        </TouchableWithoutFeedback>

        <BottomNavigation/>

        <View style={ styles.bottomSheet } pointerEvents={ 'box-none' }>
          <BottomSheet
            ref={ bottomSheetRef }
            callbackNode={ bottomSheetNode }
            snapPoints = { [ 0, screen.height ] }
            
            renderHeader = {
              () =>
                <View style={ styles.bottomSheetHeader }>
                  <View style={ styles.bottomSheetHandler }/>

                  <View style={ {
                    ...styles.bottomSheetHeaderContent,
                    width: screen.width - (sizes.windowMargin * 2)
                  } }>
                    <ChatHeader/>
                  </View>
                </View>
            }

            renderContent = {
              () =>
                <View style={ {
                  ...styles.bottomSheetContent,
                  height: screen.height - (sizes.topBarHeight + sizes.bottomSheetHeaderHeight)
                } }>
                  <Chat/>
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
    zIndex: depth.bottomSheet,
    position: 'absolute',

    width: screen.width,
    height: screen.height
  },

  holder: {
    zIndex: depth.handler,
    position: 'absolute',

    width: screen.width,
    height: screen.height,

    backgroundColor: colors.blackBackground
  },

  bottomSheetHeader: {
    alignItems: 'center',
    backgroundColor: colors.whiteBackground,

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

    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin
  },

  bottomSheetContent: {
    width: screen.width
  }
});
