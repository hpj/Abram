import React from 'react';

import { BackHandler, StyleSheet, View, Image } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

import type { Size, Profile, InboxEntry } from '../types';

import Button from './Button';

import { StoreComponent } from '../store';

import { sizes } from '../sizes';

import { depth } from '../depth';

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

  onPress(message?: 'deactivate'): void
  {
    // to stop users from spamming buttons
    if (Date.now() - this.timestamp > 300 || message === 'deactivate' || global.__TEST__)
      this.timestamp = Date.now();
    else
      return;

    const menu = this.state.menu ? false : true;

    if (menu)
      BackHandler.addEventListener('hardwareBackPress', this.deactivate);
    else
      BackHandler.removeEventListener('hardwareBackPress', this.deactivate);

    Animated.timing(this.progress, {
      duration: 150,
      toValue: menu ? 1 : 0,
      easing: Easing.linear
    }).start();

    Animated.timing(this.props.holderNode, {
      duration: 200,
      toValue: menu ? 1 : 0,
      easing: Easing.linear
    }).start();

    // update store
    this.store.set({ menu, holder: menu });
  }

  deactivate(): boolean
  {
    this.onPress('deactivate');

    return true;
  }

  render(): JSX.Element
  {
    const members = [];

    const { size, profile, activeChat } = this.state;

    const { bottomSheetNode } = this.props;

    if (activeChat.members)
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
      <View testID='v-menu' style={ styles.container }>
        <Animated.View style={ {
          ...styles.menu,

          width: size.width - sizes.windowMargin - 10,
          height: size.height * 0.65,

          opacity: menuOpacity
        } }
        />

        <View style={ styles.wrapper }>
          <Button
            testID='bn-menu'
            borderless={ true }
            buttonStyle={ styles.button }
            onPress={ this.onPress }
          >
            <Animated.View style={ styles.avatarContainer }>
              {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                <Image style={ styles.avatar } source={ profile.avatar }/>
              }
              {/* <Image style={ styles.avatar } source={ { uri: profile.avatar } }/> */}
            </Animated.View>

            {
              // TODO show the most relevant avatars
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
    zIndex: depth.menu,

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

    top: -15,
    right: 15,

    backgroundColor: colors.menuBackground,
    borderRadius: 15
  }
});

export default ChatAvatars;
