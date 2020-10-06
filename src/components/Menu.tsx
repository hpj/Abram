import React from 'react';

import { StyleSheet, View, Image, Text } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

import { openURL } from 'expo-linking';

import type { Size, Profile, InboxEntry } from '../types';

import Button from './Button';

import { depth } from '../depth';

import { StoreComponent } from '../store';

import { sizes } from '../sizes';

import getTheme from '../colors';

const colors = getTheme();

class Menu extends StoreComponent<{
  holderNode: Animated.Value<number>,
  deactivate: (() => boolean) | undefined
}, {
  menu: boolean,
  size: Size,
  activeChat: InboxEntry
}>
{
  stateWhitelist(changes: Menu['state']): boolean
  {
    if (
      changes.menu ||
      changes.activeChat
    )
      return true;
    
    return false;
  }

  progress = new Animated.Value(0);

  stateDidChange(state: Menu['state'], changes: Menu['state'], old: Menu['state']): void
  {
    if (state.menu !== old.menu)
    {
      const { menu } = state;

      Animated.timing(this.props.holderNode, {
        duration: 150,
        toValue: menu ? 1 : 0,
        easing: Easing.linear
      }).start();
  
      Animated.timing(this.progress, {
        duration: 200,
        toValue: menu ? 1 : 0,
        easing: Easing.linear
      // returns component which is used by the reanimated mocks while testing
      }).start(() => this);
    }
  }

  openPage(type: 'profile' | 'settings'): void
  {
    if (type === 'profile')
    {
      this.store.set({
        additionNavigationIcon: 'user',
        index: 2
      });
    }
    else if (type === 'settings')
    {
      this.store.set({
        additionNavigationIcon: 'settings',
        index: 3
      });
    }

    this.props.deactivate?.();
  }

  renderMain(): JSX.Element
  {
    return <View testID={ 'v-menu-content' } style={ styles.container }>

      <View style={ styles.actions }>
        <Button
          testID={ 'bn-profile' }
          buttonStyle={ styles.button  }
          textStyle={ styles.buttonText  }
          icon={ { name: 'user', size: sizes.icon * 0.75, color: colors.whiteText, style: styles.buttonIcon } }
          text={ 'Profile' }
          onPress={ () => this.openPage('profile') }
        />

        <Button
          testID={ 'bn-settings' }
          buttonStyle={ styles.button  }
          textStyle={ styles.buttonText  }
          icon={ { name: 'settings', size: sizes.icon * 0.75, color: colors.whiteText, style: styles.buttonIcon } }
          text={ 'Settings' }
          onPress={ () => this.openPage('settings') }
        />

        <Button
          testID={ 'bn-logout' }
          buttonStyle={ styles.button  }
          textStyle={ styles.buttonText  }
          icon={ { name: 'log-out', size: sizes.icon * 0.75, color: colors.whiteText, style: styles.buttonIcon } }
          text={ 'Log out' }
        />
      </View>

      <View style={ styles.legal }>

        <Button
          testID={ 'bn-privacy' }
          buttonStyle={ styles.buttonAlt  }
          textStyle={ styles.buttonTextAlt  }
          text={ 'Privacy Policy' }
          onPress={ () => openURL('https://herpproject.com/abram/privacy') }
        />

        <Button
          testID={ 'bn-terms' }
          buttonStyle={ styles.buttonAlt  }
          textStyle={ styles.buttonTextAlt  }
          text={ 'Terms of Service' }
          onPress={ () => openURL('https://herpproject.com/abram/terms') }
        />
      </View>

      <View style={ styles.footer }>
        <Image style={ styles.logo } source={ { uri: 'https://herpproject.com/assets/logo-white.png' } }/>
      </View>
    </View>;
  }

  renderChat(): JSX.Element
  {
    const { activeChat } = this.state;

    return <View testID={ 'v-menu-content' } style={ styles.container }>

      <View style={ styles.actions }>

        <Button
          testID={ 'bn-chat-mute' }
          buttonStyle={ styles.button  }
          textStyle={ styles.buttonText  }
          icon={ { name: 'volume-x', size: sizes.icon * 0.75, color: colors.whiteText, style: styles.buttonIcon } }
          text={ 'Mute' }
        />

        {
          activeChat.members.length > 2 ?
            <Button
              testID={ 'bn-chat-group' }
              buttonStyle={ styles.button  }
              textStyle={ styles.buttonText  }
              icon={ { name: 'edit-3', size: sizes.icon * 0.75, color: colors.whiteText, style: styles.buttonIcon } }
              text={ 'Group' }
            /> : undefined
        }

        <View style={ styles.space }/>

        <Button
          testID={ 'bn-chat-block' }
          buttonStyle={ styles.button  }
          textStyle={ styles.buttonText  }
          icon={ { name: 'alert-circle', size: sizes.icon * 0.75, color: colors.whiteText, style: styles.buttonIcon } }
          text={ activeChat.members.length > 2 ? 'Leave, Block & Report' : 'Block & Report' }
        />
      
      </View>
    </View>;
  }

  render(): JSX.Element
  {
    const { size, activeChat, menu } = this.state;

    const width = size.width - sizes.windowMargin - 10;
    const height = size.height * 0.55;

    const top  = sizes.topBarHeight + (sizes.windowMargin * 1.15);

    const opacity = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 0, 1 ]
    });
    
    const y = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ top - 3, top ]
    });

    return <Animated.View testID={ 'v-menu' } style={ {
      ...styles.menu,

      top: y,
      
      width: width,
      height: height,

      opacity
    } }
    pointerEvents={ menu ? 'box-none' : 'none' }>
      { activeChat?.id ? this.renderChat() : this.renderMain() }
    </Animated.View>;
  }
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    zIndex: depth.topBar,

    right: sizes.windowMargin * 0.5,

    backgroundColor: colors.menuBackground,
    borderRadius: sizes.windowMargin * 0.75
  },

  container: {
    flex: 1
  },

  header: {
    position: 'absolute',
    justifyContent: 'center',

    left: 0
  },

  text: {
    fontSize: 15,
    color: colors.whiteText,
    fontWeight: 'bold'
  },

  info: {
    fontSize: 13,
    color: colors.greyText
  },

  actions: {
    flexGrow: 1,
    marginVertical: sizes.windowMargin * 0.85
  },

  button: {
    flexDirection: 'row-reverse',
    alignItems: 'center',

    padding: sizes.windowMargin * 0.85
  },

  buttonIcon: {
    marginHorizontal: sizes.windowMargin * 1.15
  },

  buttonText: {
    flex: 1,
    fontSize: 14,

    color: colors.whiteText,
    marginHorizontal: sizes.windowMargin * 1.15
  },

  space: {
    alignSelf: 'center',
    width: '90%',
    height: 1,
    backgroundColor: colors.greyText,

    marginVertical: 12
  },

  legal: {
    justifyContent: 'center',
    flexDirection: 'row'
  },

  buttonAlt: {
    padding: sizes.windowMargin * 0.45
  },

  buttonTextAlt: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.greyText
  },

  footer: {
    alignItems: 'center',
    margin: sizes.windowMargin
  },

  logo: {
    width: 32,
    height: 8,

    resizeMode: 'contain'
  }
});

export default Menu;
