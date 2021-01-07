import React from 'react';

import {
  StyleSheet, StatusBar, Platform, BackHandler, Keyboard,
  SafeAreaView, View, Text, TouchableWithoutFeedback, LayoutChangeEvent
} from 'react-native';

import * as SplashScreen from 'expo-splash-screen';

import Animated from 'react-native-reanimated';

import BottomSheet from 'reanimated-bottom-sheet';

import NavigationView from './components/NavigationView';

import Inbox from './screens/Inbox';
import Discover from './screens/Discover';

import Profile from './screens/Profile';
import Settings from './screens/Settings';

import Menu from './components/Menu';

import TopBar from './components/TopBar';
import BottomNavigation from './components/BottomNavigation';

import Popup from './components/Popup';

import Chat from './screens/Chat';
import ChatHeader from './components/ChatHeader';

import { Size, Profile as TProfile } from './types';

import { fetch, locale } from './i18n';

import { StoreComponent } from './store';

import { sizes } from './sizes';

import { depth } from './depth';

import getTheme from './colors';

const colors = getTheme();

export default class App extends StoreComponent<unknown, {
  error: string,
  loaded: boolean,

  size: Size,

  index: number,

  profile: TProfile,
  focusedProfile: TProfile,
  
  popup: boolean,
  holder: boolean,
  
  holderCallback: (() => void)
}>
{
  constructor()
  {
    super();

    // bind functions to use as callbacks

    this.onLayout = this.onLayout.bind(this);
    this.onBack = this.onBack.bind(this);
  }

  bottomSheetRef: React.RefObject<BottomSheet> =  React.createRef()
  topBarRef: React.RefObject<TopBar> =  React.createRef()

  bottomSheetNode = new Animated.Value(1)
  holderNode = new Animated.Value(0)

  stateWhitelist(changes: App['state']): boolean
  {
    if (
      changes.error ||
      changes.loaded ||

      changes.size ||

      changes.index ||

      changes.profile ||
      changes.focusedProfile ||

      changes.popup ||
      changes.holder ||

      changes.holderCallback
    )
      return true;
    
    return false;
  }

  async load(): Promise<void>
  {
    await fetch(locale.id);
  }

  async componentDidMount(): Promise<void>
  {
    super.componentDidMount();

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

      /* istanbul ignore next */
      if (Platform.OS === 'android')
        StatusBar.setBackgroundColor(colors.blackBackground);

      StatusBar.setBarStyle('light-content');
      // StatusBar.setBarStyle((colors.theme === 'dark') ? 'light-content' : 'dark-content');

      // hides the splash screen and shows the app
      await SplashScreen.hideAsync();
    }
  }

  onLayout({ nativeEvent }: LayoutChangeEvent): void
  {
    const { size } = this.state;
    
    const { width, height } = nativeEvent.layout;

    if (size.width === 0 || size.height === 0)
    {
      // get the correct size of window on android
      // https://github.com/facebook/react-native/issues/23693

      this.store.set({
        size: {
          width,
          height
        },
        layout: {
          width,
          height
        }
        // FIX workaround: an issue that cases
        // the bottom sheet does not get assigned
        // its correct snap points
        // although this does slow the app start time
      }, () => this.forceUpdate());
    }
    else
    {
      // layout is used in some cases
      // like the bottom sheet resizing to account for the keyboard height
      this.store.set({
        layout: {
          width,
          height
        }
      });
    }
  }

  onClose(closed: boolean): void
  {
    if (closed)
    {
      Keyboard.dismiss();

      this.store.set({ chat: false });

      BackHandler.removeEventListener('hardwareBackPress', this.onBack);
    }
    else
    {
      this.store.set({ chat: true });

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
      return <SafeAreaView testID={ 'v-error' } style={ styles.error }>
        <Text style={ styles.errorText }>{ this.state.error }</Text>
      </SafeAreaView>;

    if (!this.state.loaded)
      return <View/>;
    
    // get the correct size of window on android
    // https://github.com/facebook/react-native/issues/23693
    if (this.state.size.width === 0 || this.state.size.height === 0)
    {
      return <SafeAreaView onLayout={ this.onLayout } style={ styles.container }/>;
    }

    const {
      size,
      profile, focusedProfile,
      popup, holder, holderCallback
    } = this.state;

    const holderOpacity = this.holderNode.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 0, 0.75 ]
    });

    return <SafeAreaView testID={ 'v-main-area' } onLayout={ this.onLayout } style={ styles.container }>

      <Popup holderNode={ this.holderNode }/>

      <Menu close={ this.onBack } holderNode={ this.holderNode } deactivate={ this.topBarRef.current?.chatAvatarsRef.current?.deactivate }/>

      <TopBar ref={ this.topBarRef } holderNode={ this.holderNode } bottomSheetNode={ this.bottomSheetNode }/>

      <View testID={ 'v-navigation' } style={ styles.views }>

        <NavigationView testID={ 'v-inbox' } index={ 0 }>
          <Inbox snapTo={ this.bottomSheetRef.current?.snapTo }/>
        </NavigationView>

        <NavigationView testID={ 'v-discover' } index={ 1 }>
          <Discover/>
        </NavigationView>

        <NavigationView testID={ 'v-profile' } index={ 2 }>
          <Profile user={ profile } profile={ focusedProfile }/>
        </NavigationView>

        <NavigationView testID={ 'v-settings' } index={ 3 }>
          <Settings/>
        </NavigationView>

      </View>

      <TouchableWithoutFeedback onPress={ holderCallback }>
        <Animated.View testID={ 'v-holder' } style={ {
          ...styles.holder,

          zIndex: popup ? depth.popupHolder : depth.menuHolder,

          width: size.width,
          height: size.height,
          opacity: holderOpacity
        } }
        pointerEvents={ (popup || holder) ? 'box-only' : 'none' }/>
      </TouchableWithoutFeedback>

      <BottomNavigation/>

      <View testID={ 'v-bottom-sheet' } style={ {
        ...styles.bottomSheet,
        width: size.width,
        height: size.height
      } } pointerEvents={ 'box-none' }>
        <BottomSheet
          ref={ this.bottomSheetRef }
          callbackNode={ this.bottomSheetNode }

          initialSnap={ 1 }
          snapPoints = { [ size.height, 0  ] }

          enabledContentGestureInteraction={ false }

          onOpenStart={ () => this.onClose(false) }
          onOpenEnd={ () => this.onClose(false) }
          
          onCloseStart={ () => this.onClose(true) }
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

          renderContent = { () => <Chat/> }
        />
      </View>

    </SafeAreaView>;
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

    width: 65,
    height: 4,

    marginTop: 10,
    borderRadius: 10
  },

  bottomSheetHeaderContent: {
    flex: 1,

    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin
  }
});
