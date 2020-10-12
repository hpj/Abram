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
  close?: (() => void) | undefined,
  holderNode: Animated.Value<number>,
  deactivate: (() => boolean) | undefined
}, {
  size: Size,
  menu: boolean,
  profile: Profile,
  chat: boolean,
  activeChat: InboxEntry
}>
{
  stateWhitelist(changes: Menu['state']): boolean
  {
    if (
      changes.size ||
      changes.menu ||
      changes.profile ||
      changes.chat ||
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

  openProfile(profile: Profile): void
  {
    this.store.set({
      title: '',
      index: 2,
      additionNavigationIcon: 'user',
      focusedProfile: profile
    });

    // deactivate menu
    this.props.deactivate?.();

    // snap close the bottom sheet
    this.props.close?.();
  }

  openSettings(): void
  {
    this.store.set({
      title: 'Settings',
      index: 3,
      additionNavigationIcon: 'settings'
    });

    // deactivate menu
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
          onPress={ () => this.openProfile(this.state.profile) }
        />

        <View style={ styles.space }/>

        <Button
          testID={ 'bn-settings' }
          buttonStyle={ styles.button  }
          textStyle={ styles.buttonText  }
          icon={ { name: 'settings', size: sizes.icon * 0.75, color: colors.whiteText, style: styles.buttonIcon } }
          text={ 'Settings' }
          onPress={ () => this.openSettings() }
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

        <Text style={ styles.buttonTextAlt }> | </Text>

        <Button
          testID={ 'bn-terms' }
          buttonStyle={ styles.buttonAlt  }
          textStyle={ styles.buttonTextAlt  }
          text={ 'Terms of Service' }
          onPress={ () => openURL('https://herpproject.com/abram/terms') }
        />

        <Text style={ styles.buttonTextAlt }> | </Text>

        <Button
          testID={ 'bn-ethics' }
          buttonStyle={ styles.buttonAlt  }
          textStyle={ styles.buttonTextAlt  }
          text={ 'Ethics & Rules' }
          onPress={ () => openURL('https://herpproject.com/abram/ethics') }
        />
      </View>

      <View style={ styles.footer }>
        <Image style={ styles.logo } source={ { uri: 'https://herpproject.com/assets/logo-white.png' } }/>
      </View>
    </View>;
  }

  renderChat(): JSX.Element
  {
    const { profile, activeChat } = this.state;

    const members = [ ...activeChat.members ];

    // remove self from array
    members.splice(
      members.findIndex(member => member.uuid === profile.uuid), 1);

    return <View testID={ 'v-menu-content' } style={ styles.container }>

      <View style={ styles.actions }>

        {
          members.map((member, index) => <Button
            key={ index }
            testID={ 'bn-chat-profile' }
            buttonStyle={ styles.button  }
            textStyle={ styles.buttonText  }
            icon={ { name: 'user', size: sizes.icon * 0.75, color: colors.whiteText, style: styles.buttonIcon } }
            text={ member.nickname }
            onPress={ () => this.openProfile(member) }
          />)
        }

        <View style={ styles.space }/>

        {
          activeChat.members.length > 2 ?
            <Button
              testID={ 'bn-chat-title' }
              buttonStyle={ styles.button  }
              textStyle={ styles.buttonText  }
              icon={ { name: 'edit-2', size: sizes.icon * 0.65, color: colors.whiteText, style: styles.buttonIcon } }
              text={ 'Title' }
            /> : undefined
        }

        <Button
          testID={ 'bn-chat-mute' }
          buttonStyle={ styles.button  }
          textStyle={ styles.buttonText  }
          icon={ { name: 'volume-x', size: sizes.icon * 0.7, color: colors.whiteText, style: styles.buttonIcon } }
          text={ 'Mute' }
        />

        {
          activeChat.members.length > 2 ?
            <Button
              testID={ 'bn-chat-kick' }
              buttonStyle={ styles.button  }
              textStyle={ styles.buttonText  }
              icon={ { name: 'user-minus', size: sizes.icon * 0.7, color: colors.whiteText, style: styles.buttonIcon } }
              text={ 'Kick' }
            /> : undefined
        }

        <Button
          testID={ 'bn-chat-block' }
          buttonStyle={ styles.button  }
          textStyle={ styles.buttonText  }
          icon={ { name: 'alert-triangle', size: sizes.icon * 0.75, color: colors.whiteText, style: styles.buttonIcon } }
          text={ activeChat.members.length > 2 ? 'Leave, Block & Report' : 'Block & Report' }
        />
      
      </View>
    </View>;
  }

  render(): JSX.Element
  {
    const { size, chat, menu } = this.state;

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
      minHeight: height,

      opacity
    } }
    pointerEvents={ menu ? 'box-none' : 'none' }>
      { chat ? this.renderChat() : this.renderMain() }
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
    color: colors.greyText,

    alignSelf: 'center',

    fontSize: 11,
    fontWeight: 'bold'
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
