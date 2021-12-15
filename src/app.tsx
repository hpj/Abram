import React from 'react';

import {
  StyleSheet, StatusBar, BackHandler, Keyboard, Platform,
  View, Text, TouchableWithoutFeedback, LayoutChangeEvent
} from 'react-native';

import * as Font from 'expo-font';

import constants from 'expo-constants';

import * as SplashScreen from 'expo-splash-screen';

import { Feather } from '@expo/vector-icons';

import Animated from 'react-native-reanimated';

import BottomSheet from 'reanimated-bottom-sheet';

import AccountManager from 'react-native-account-manager';

import NavigationView from './components/NavigationView';

import Inbox from './screens/Inbox';
import Discover from './screens/Discover';

import Profile from './screens/Profile';

import Menu from './components/Menu';

import TopBar from './components/TopBar';
import BottomNavigation from './components/BottomNavigation';

import Popup from './components/Popup';

import Chat from './screens/Chat';
import ChatHeader from './components/ChatHeader';

import { Size, Profile as TProfile } from './types';

import { StoreComponent } from './store';

import i18n from './i18n';

import { sizes } from './sizes';

import { depth } from './depth';

import getTheme from './colors';

const colors = getTheme();

export default class App extends StoreComponent<unknown, {
  error: string,

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

  bottomSheetRef: React.RefObject<BottomSheet> =  React.createRef();
  topBarRef: React.RefObject<TopBar> =  React.createRef();

  bottomSheetNode = new Animated.Value(1);
  holderNode = new Animated.Value(0);

  stateWhitelist(changes: App['state']): boolean
  {
    if (
      changes.error ||

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
    await Promise.all([
      Font.loadAsync(Feather.font)
    ]);
  }

  async componentDidMount(): Promise<void>
  {
    super.componentDidMount();

    await SplashScreen.preventAutoHideAsync();
  
    // load resource and cache on app-start
    try
    {
      await this.load();
      
      AccountManager.getAccountsByType('com.google').then((accounts) =>
      {
        console.log('available accounts', accounts);
      });

      await new Promise<void>(resolve =>
      {
        this.store.set({
          index: 0,
          title: 'Inbox'
        }, resolve);
      });
    }
    catch (err)
    {
      // encountered an error during loading
      this.setState({ error: err });
    }
    finally
    {
      // set status-bar style

      // istanbul ignore next
      if (Platform.OS === 'android')
      {
        StatusBar.setBackgroundColor(colors.blackBackground);
        StatusBar.setBarStyle('light-content');

        // StatusBar.setBarStyle((colors.theme === 'dark') ? 'light-content' : 'dark-content');
      }

      BackHandler.addEventListener('hardwareBackPress', this.onBack);

      // hides the splash screen and shows the app
      await SplashScreen.hideAsync();
    }
  }

  onLayout({ nativeEvent }: LayoutChangeEvent): void
  {
    const { size } = this.state;
    
    const { width } = nativeEvent.layout;
    let { height } = nativeEvent.layout;

    // since on android we have a translucent status bar
    // we need to subtract its size from height to have an accurate assessment
    // of the real window height
    height -= constants.statusBarHeight;

    if (size.width !== width || size.height !== height)
    {
      // get the correct size of window on android
      // https://github.com/facebook/react-native/issues/23693

      this.store.set({
        size: {
          width,
          height
        }
        // FIX workaround: an issue that cases
        // the bottom sheet does not get assigned
        // its correct snap points
        // although this does slow the app start time
      }, () => this.forceUpdate());
    }
  }

  onClose(closed: boolean): void
  {
    if (closed)
    {
      Keyboard.dismiss();

      this.store.set({ chat: false });
    }
    else
    {
      this.store.set({ chat: true });
    }
  }
  
  onBack(): boolean
  {
    // close bottom sheet

    const { chat, index }: { chat: boolean, index: number } = this.store.state;

    if (chat)
      this.bottomSheetRef.current?.snapTo(1);
    else if (index > 0)
      this.store.set({ index: 0, title: i18n('inbox') });
    else
      BackHandler.exitApp();

    return true;
  }

  render(): JSX.Element
  {
    if (this.state.error)
      return <View testID={ 'v-error' } style={ styles.error }>
        <Text style={ styles.errorText }>{ this.state.error }</Text>
      </View>;

    // get the correct size of window on android
    // https://github.com/facebook/react-native/issues/23693
    if (this.state.size.width === 0 || this.state.size.height === 0)
      return <View onLayout={ this.onLayout } style={ styles.container }/>;

    const {
      size,
      profile, focusedProfile,
      popup, holder, holderCallback
    } = this.state;

    const holderOpacity = this.holderNode.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 0, 0.75 ]
    });

    return <View testID={ 'v-main-area' } onLayout={ this.onLayout } style={ styles.container }>
      <View style={ {
        top: constants.statusBarHeight,
        width: size.width,
        height: size.height
      } }>

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

        </View>

        <TouchableWithoutFeedback onPress={ holderCallback }>
          <Animated.View testID={ 'v-holder' } style={ {
            ...styles.holder,

            zIndex: popup ? depth.popupHolder : depth.menuHolder,
            backgroundColor: popup ? colors.popupHolder : colors.menuHolder,

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

            renderContent = { () => <View style={ {
            // height minus the header height
              height: size.height - (sizes.topBarHeight + sizes.topBarBigMargin)
            } }>
              <Chat/>
            </View> }
          />
        </View>

      </View>
    </View>;
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
    position: 'absolute'
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
