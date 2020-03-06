import React from 'react';

import { StyleSheet, StatusBar, BackHandler, SafeAreaView, View, Text, TouchableWithoutFeedback, Image } from 'react-native';

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

import { sizes } from './sizes.js';

import { depth } from './depth.js';

import getTheme from './colors.js';

import Avatar from './avataaars';

const colors = getTheme();

export default class App extends StoreComponent
{
  constructor()
  {
    super();

    this.bottomSheetNode = new Animated.Value(1);
    this.holderNode = new Animated.Value(0);

    this.bottomSheetRef = React.createRef();

    // bind functions to use as callbacks

    this.onBack = this.onBack.bind(this);
  }

  componentDidMount()
  {
    super.componentDidMount();

    SplashScreen.preventAutoHide();
  
    // load resource and cache on app-start
    // crashes the app if loading encounters an error
    load((error) =>
    {
      // allow app UI to be rendered

      // encountered an error during loading
      if (error)
        this.setState({ error });
      // the second forced updated is
      // needed to render the navigation view
      else
        this.setState({ loaded: true }, this.forceUpdate);

      // set status-bar style
      StatusBar.setBackgroundColor(colors.blackBackground);
      // StatusBar.setBarStyle((colors.theme === 'dark') ? 'light-content' : 'dark-content');
      StatusBar.setBarStyle('light-content');
  
      // hides the splash screen and shows the app
      SplashScreen.hide();
    });
  }

  onClose(open)
  {
    if (open)
      BackHandler.addEventListener('hardwareBackPress', this.onBack);
    else
      BackHandler.removeEventListener('hardwareBackPress', this.onBack);
  }

  onBack()
  {
    // close bottom sheet
    this.bottomSheetRef.current.snapTo(1);

    return true;
  }

  render()
  {
    if (this.state.error)
      return <SafeAreaView testID='v-error' style={ styles.error }>
        <Text style={ styles.errorText }>{ this.state.error }</Text>
      </SafeAreaView>;

    if (!this.state.loaded)
      return <View/>;

    // eslint-disable-next-line react-native/no-inline-styles
    return <View style={ {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.red
    } }>

      <Avatar/>

    </View>;
  
    // const holderOpacity = this.holderNode.interpolate({
    //   inputRange: [ 0, 1 ],
    //   outputRange: [ 0, 0.75 ]
    // });

    // return (
    //   <SafeAreaView testID='v-main-area' style={ styles.container }>

    //     <TopBar holderNode={ this.holderNode } bottomSheetNode={ this.bottomSheetNode }/>

    //     <View testID='v-navigation' style={ styles.views }>

    //       <NavigationView testID='v-inbox' active={ (this.state.index === 0) }>
    //         <Inbox bottomSheetSnapTo={ this.bottomSheetRef.current?.snapTo }/>
    //       </NavigationView>

    //       <NavigationView testID='v-discover' active={ (this.state.index === 1) }>
    //         <Discover/>
    //       </NavigationView>

    //     </View>

    //     <TouchableWithoutFeedback>
    //       <Animated.View testID='v-holder' style={ {
    //         ...styles.holder,

    //         width: this.state.size.width,
    //         height: this.state.size.height,
    //         opacity: holderOpacity
    //       } }
    //       pointerEvents={ (this.state.holder) ? 'box-only' : 'none' }/>
    //     </TouchableWithoutFeedback>

    //     <BottomNavigation/>

    //     <View testID='v-bottom-sheet' style={ {
    //       ...styles.bottomSheet,
    //       width: this.state.size.width,
    //       height: this.state.size.height
    //     } } pointerEvents={ 'box-none' }>
    //       <BottomSheet
    //         ref={ this.bottomSheetRef }
    //         callbackNode={ this.bottomSheetNode }

    //         initialSnap={ 1 }
    //         snapPoints = { [ this.state.size.height, 0  ] }

    //         enabledContentGestureInteraction={ false }

    //         onOpenStart={ () => this.onClose(false) }
    //         onCloseEnd={ () => this.onClose(true) }

    //         renderHeader = {
    //           () =>
    //             <View style={ styles.bottomSheetHeader }>
    //               <View style={ styles.bottomSheetHandler }/>

    //               <View style={ {
    //                 ...styles.bottomSheetHeaderContent,
    //                 width: this.state.size.width - (sizes.windowMargin * 2)
    //               } }>
    //                 <ChatHeader/>
    //               </View>
    //             </View>
    //         }

    //         renderContent = { () =>
    //           <View style={ {
    //             ...styles.bottomSheetContent,
    //             height: this.state.size.height
    //           } }>
    //             <Chat/>
    //           </View>
    //         }
    //       />
    //     </View>

    //   </SafeAreaView>
    // );
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
