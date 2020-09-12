import React from 'react';

import {
  StyleSheet, StatusBar, Platform, BackHandler, Keyboard,
  SafeAreaView, View, Text, TouchableWithoutFeedback
} from 'react-native';

import * as SplashScreen from 'expo-splash-screen';

import Animated from 'react-native-reanimated';

import BottomSheet from 'reanimated-bottom-sheet';

import NavigationView from './components/NavigationView';

import TopBar from './components/TopBar';
import BottomNavigation from './components/BottomNavigation';

import Inbox from './screens/Inbox';
import Discover from './screens/Discover';

import ChatHeader from './screens/ChatHeader';
import Chat from './screens/Chat';

import { fetch, locale } from './i18n';

import { StoreComponent } from './store';

import { sizes } from './sizes';

import { depth } from './depth';

import getTheme from './colors';

const colors = getTheme();

export default class App extends StoreComponent<unknown, {
  index: number,
  error: string,
  loaded: boolean,
  size: {
    width: number,
    height: number
  },
  holder: boolean
}>
{
  constructor()
  {
    super();

    // bind functions to use as callbacks

    this.onBack = this.onBack.bind(this);
  }

  bottomSheetRef: React.RefObject<BottomSheet> =  React.createRef()

  bottomSheetNode = new Animated.Value(1)
  holderNode = new Animated.Value(0)

  async load(): Promise<void>
  {
    await fetch(locale.id);
  }

  async componentDidMount(): Promise<void>
  {
    super.componentDidMount();

    // console.log('hiding splash screen');

    await SplashScreen.preventAutoHideAsync();
  
    // load resource and cache on app-start
    try
    {
      await this.load();

      this.setState({ loaded: true }, this.forceUpdate);
    }
    catch (err)
    {
      // encountered an error during loading
      this.setState({ error: err });
    }
    finally
    {
      // set status-bar style

      if (Platform.OS === 'android')
        StatusBar.setBackgroundColor(colors.blackBackground);

      StatusBar.setBarStyle('light-content');
      // StatusBar.setBarStyle((colors.theme === 'dark') ? 'light-content' : 'dark-content');
  
      // hides the splash screen and shows the app
      await SplashScreen.hideAsync();
    }
  }

  onClose(closed: boolean): void
  {
    if (closed)
    {
      Keyboard.dismiss();

      BackHandler.removeEventListener('hardwareBackPress', this.onBack);
    }
    else
    {
      BackHandler.addEventListener('hardwareBackPress', this.onBack);
    }
  }

  onBack(): boolean
  {
    // close bottom sheet
    this.bottomSheetRef.current?.snapTo(1);

    return true;
  }

  render(): JSX.Element
  {
    if (this.state.error)
      return <SafeAreaView testID='v-error' style={ styles.error }>
        <Text style={ styles.errorText }>{ this.state.error }</Text>
      </SafeAreaView>;

    if (!this.state.loaded)
      return <View/>;

    const holderOpacity = this.holderNode.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 0, 0.75 ]
    });

    return (
      <SafeAreaView testID='v-main-area' style={ styles.container }>

        <TopBar holderNode={ this.holderNode } bottomSheetNode={ this.bottomSheetNode }/>

        <View testID='v-navigation' style={ styles.views }>

          <NavigationView testID='v-inbox' active={ (this.state.index === 0) }>
            <Inbox snapTo={ this.bottomSheetRef.current?.snapTo }/>
          </NavigationView>

          <NavigationView testID='v-discover' active={ (this.state.index === 1) }>
            <Discover/>
          </NavigationView>

        </View>

        <TouchableWithoutFeedback>
          <Animated.View testID='v-holder' style={ {
            ...styles.holder,

            width: this.state.size.width,
            height: this.state.size.height,
            opacity: holderOpacity
          } }
          pointerEvents={ (this.state.holder) ? 'box-only' : 'none' }/>
        </TouchableWithoutFeedback>

        <BottomNavigation/>

        <View testID='v-bottom-sheet' style={ {
          ...styles.bottomSheet,
          width: this.state.size.width,
          height: this.state.size.height
        } } pointerEvents={ 'box-none' }>
          <BottomSheet
            ref={ this.bottomSheetRef }
            callbackNode={ this.bottomSheetNode }

            initialSnap={ 1 }
            snapPoints = { [ this.state.size.height, 0  ] }

            enabledContentGestureInteraction={ false }

            onOpenStart={ () => this.onClose(false) }
            onCloseEnd={ () => this.onClose(true) }

            renderHeader = {
              () =>
                <View style={ styles.bottomSheetHeader }>
                  <View style={ styles.bottomSheetHandler }/>

                  <View style={ {
                    ...styles.bottomSheetHeaderContent,
                    width: this.state.size.width - (sizes.windowMargin * 2)
                  } }>
                    <ChatHeader/>
                  </View>
                </View>
            }

            renderContent = { () =>
              <View style={ {
                ...styles.bottomSheetContent,
                height: this.state.size.height
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
    backgroundColor: colors.blackBackground
  },

  error: {
    flex: 1,
    backgroundColor: colors.blackBackground,

    alignItems: 'center',
    justifyContent: 'center'
  },

  errorText: {
    color: colors.whiteText,
    backgroundColor: colors.red,

    fontSize: 18,
    borderRadius: 5,
    padding: 15
  },

  views: {
    flex: 1
  },

  bottomSheet: {
    zIndex: depth.bottomSheet,
    position: 'absolute'
  },

  holder: {
    zIndex: depth.handler,
    position: 'absolute',

    backgroundColor: colors.blackBackground
  },

  bottomSheetHeader: {
    alignItems: 'center',
    backgroundColor: colors.blackBackground,

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
    backgroundColor: colors.blackBackground
  }
});
