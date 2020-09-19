import React from 'react';

import { StyleSheet, View, Image, Text } from 'react-native';

import { openURL } from 'expo-linking';

import type { Profile, InboxEntry } from '../types';

import Button from './Button';

import { StoreComponent } from '../store';

import { sizes } from '../sizes';

import getTheme from '../colors';

const colors = getTheme();

class Menu extends StoreComponent<{
  deactivate: () => void
}, {
  profile: Profile,
  activeChat: InboxEntry
}>
{
  stateWhitelist(changes: Menu['state']): boolean
  {
    if (
      changes.profile ||
      changes.activeChat
    )
      return true;
    
    return false;
  }

  openPage(type: 'profile' | 'settings'): void
  {
    
    if (type === 'profile')
    {
      this.store.set({
        additionNavigationIcon: 'user',
        index: 2
      });

      this.props.deactivate?.();
    }
    else if (type === 'settings')
    {
      this.store.set({
        additionNavigationIcon: 'settings',
        index: 3
      });

      this.props.deactivate?.();
    }
  }

  render(): JSX.Element
  {
    const { profile, activeChat } = this.state;

    return <View testID={ 'v-menu-content' } style={ styles.container }>
      <View style={ styles.header }>
        <Text style={ styles.greetings }>Hello,</Text>
        <Text style={ styles.text }>{ profile.displayName }</Text>
      </View>
      <View style={ styles.actions }>
        <Button
          buttonStyle={ styles.button  }
          textStyle={ styles.buttonText  }
          icon={ { name: 'user', size: sizes.icon * 0.85, color: colors.whiteText, style: styles.buttonIcon } }
          text={ 'Profile' }
          onPress={ () => this.openPage('profile') }
        />

        <Button
          buttonStyle={ styles.button  }
          textStyle={ styles.buttonText  }
          icon={ { name: 'settings', size: sizes.icon * 0.85, color: colors.whiteText, style: styles.buttonIcon } }
          text={ 'Settings' }
          onPress={ () => this.openPage('settings') }
        />
      </View>
      <View style={ styles.legal }>
        <Button
          buttonStyle={ styles.buttonAlt  }
          textStyle={ styles.buttonTextAlt  }
          text={ 'Privacy Policy' }
          onPress={ () => openURL('https://herpproject.com/abram/privacy') }
        />
        <Button
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  header: {
    height: sizes.avatar,
    margin: sizes.windowMargin * 0.75,

    justifyContent: 'center'
  },

  greetings: {
    fontSize: 13,
    color: colors.greyText,
    fontWeight: '700'
  },

  text: {
    fontSize: 16,
    color: colors.whiteText,
    fontWeight: '700'
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

  legal: {
    justifyContent: 'center',
    flexDirection: 'row'
  },

  buttonAlt: {
    padding: sizes.windowMargin * 0.65
  },

  buttonTextAlt: {
    fontSize: 14,
    color: colors.greyText
  },

  footer: {
    flexDirection: 'row',
    margin: sizes.windowMargin
  },

  logo: {
    flex: 1,
    resizeMode: 'contain',
    height: sizes.icon * 0.5
  }
});

export default Menu;
