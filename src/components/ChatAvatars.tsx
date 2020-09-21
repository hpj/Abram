import React from 'react';

import { BackHandler, StyleSheet, View, Image } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

import type { Size, Profile, InboxEntry } from '../types';

import Button from './Button';

import Menu from './Menu';

import { StoreComponent } from '../store';

import { sizes } from '../sizes';

import getTheme from '../colors';

declare const global: {
  __TEST__: boolean
};

const colors = getTheme();

class ChatAvatars extends StoreComponent<{
  holderNode: Animated.Value<number>,
  bottomSheetNode: Animated.Value<number>
}, {
  menu: boolean,
  size: Size,
  profile: Profile,
  activeChat: InboxEntry
}>
{
  constructor()
  {
    super({
      menu: false
    });
    
    // bind functions to use as callbacks
    
    this.onPress = this.onPress.bind(this);
    this.deactivate = this.deactivate.bind(this);
  }

  timestamp = Date.now()

  progress = new Animated.Value(0);

  stateWhitelist(changes: ChatAvatars['state']): boolean
  {
    if (
      changes.menu ||
      changes.size ||
      changes.profile ||
      changes.activeChat
    )
      return true;
    
    return false;
  }

  onPress(): void
  {
    // istanbul ignore else
    // to stop users from spamming buttons
    if (Date.now() - this.timestamp > 350 || global.__TEST__)
      this.timestamp = Date.now();
    else
      return;

    const menu = this.state.menu ? false : true;

    if (menu)
      BackHandler.addEventListener('hardwareBackPress', this.deactivate);
    else
      BackHandler.removeEventListener('hardwareBackPress', this.deactivate);

    // update store
    this.store.set({
      menu,
      holder: menu,
      holderCallback: menu ? this.deactivate : undefined
    }, () =>
    {
      Animated.timing(this.props.holderNode, {
        duration: 200,
        toValue: menu ? 1 : 0,
        easing: Easing.linear
      }).start();

      Animated.timing(this.progress, {
        duration: 150,
        toValue: menu ? 1 : 0,
        easing: Easing.linear
      // returns component which is used by the reanimated mocks while testing
      }).start(() => this);
    });
  }

  deactivate(): boolean
  {
    this.onPress();

    return true;
  }

  render(): JSX.Element
  {
    const members = [];

    const { size, profile, activeChat } = this.state;

    const { bottomSheetNode } = this.props;

    if (activeChat?.members)
      members.push(...activeChat.members);

    // remove self from array
    members.splice(
      members.findIndex(member => member.uuid === profile.uuid), 1);

    const menuOpacity = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 0, 1 ]
    });

    const avatarOpacity = bottomSheetNode.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 1, 0 ]
    });

    const avatarWidth = bottomSheetNode.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ sizes.avatar / 2, 0 ]
    });

    const avatarMarginLeft = bottomSheetNode.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ -(sizes.avatar / 2), sizes.avatar / 2 ]
    });

    return (
      <View testID={ 'v-menu' } style={ styles.container }>
        <Animated.View style={ {
          ...styles.menu,

          width: size.width - sizes.windowMargin - 10,
          height: size.height * 0.55,

          opacity: menuOpacity
        } }
        >
          <Menu deactivate={ this.deactivate }/>
        </Animated.View>

        <View style={ styles.wrapper }>
          <Button
            testID={ 'bn-menu' }
            useAlternative={ true }
            borderless={ true }
            buttonStyle={ styles.button }
            onPress={ this.onPress }
          >
            <Animated.View style={ styles.avatarContainer }>
              {/* @ts-ignore */}
              <Image style={ styles.avatar } source={ profile.avatar }/>
              {/* <Image style={ styles.avatar } source={ { uri: profile.avatar } }/> */}
            </Animated.View>

            {
              members.splice(0, 2).map((member, i) =>
              {
                return <Animated.View key={ i } style={ {
                  ...styles.avatarContainer,
                  opacity: avatarOpacity,
                  width: avatarWidth
                } }>
                  <Animated.View style={ { marginLeft: avatarMarginLeft } }>
                    <Image
                      style={ styles.avatar }
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      //@ts-ignore
                      source={ member.avatar }
                      // source={ { uri: member.avatar } }
                    />
                  </Animated.View>
                </Animated.View>;
              })
            }
          </Button>
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    minWidth: sizes.avatar,
    height: sizes.avatar
  },

  wrapper: {
    minWidth: sizes.avatar,
    height: sizes.avatar,
    borderRadius: sizes.avatar,

    marginRight: sizes.windowMargin
  },

  button: {
    flexDirection: 'row'
  },

  avatarContainer: {
    width: sizes.avatar,
    height: sizes.avatar,

    borderRadius: sizes.avatar
  },

  avatar: {
    position: 'absolute',

    backgroundColor: colors.iconBackground,

    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: sizes.avatar
  },

  menu: {
    position: 'absolute',

    top: -(sizes.windowMargin * 0.45),
    right: sizes.windowMargin * 0.5,

    backgroundColor: colors.menuBackground,
    borderRadius: sizes.windowMargin * 0.75
  }
});

export default ChatAvatars;
