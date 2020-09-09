import React from 'react';

import { BackHandler, StyleSheet, View, Image } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

import { Size, Profile, InboxEntry } from '../types';

import Button from './Button';

import { StoreComponent } from '../store';

import { sizes } from '../sizes';

import { depth } from '../depth';

import getTheme from '../colors';

const colors = getTheme();

class ChatAvatars extends StoreComponent<
{
  holderNode: Animated.Value<number>,
  bottomSheetNode: Animated.Value<number>
}, {
  size: Size,
  profile: Profile,
  activeChat: InboxEntry
}>
{
  constructor()
  {
    super(undefined, {
      menu: false
    });
    
    // bind functions to use as callbacks
    
    this.onPress = this.onPress.bind(this);
  }

  menu = false;

  progress = new Animated.Value(0);

  onPress(): boolean
  {
    this.menu = this.menu ? false : true;

    // control app's holder view
    this.store.set({ holder: this.menu });

    if (this.menu)
      BackHandler.addEventListener('hardwareBackPress', this.onPress);
    else
      BackHandler.removeEventListener('hardwareBackPress', this.onPress);

    Animated.timing(this.progress, {
      duration: 100,
      toValue: (this.menu) ? 1 : 0,
      easing: Easing.linear
    }).start();

    Animated.timing(this.props.holderNode, {
      duration: 200,
      toValue: (this.menu) ? 1 : 0,
      easing: Easing.linear
    }).start();

    return true;
  }

  render(): JSX.Element
  {
    const activeChat = this.state.activeChat;

    const members = [];

    if (activeChat.members)
      members.push(...activeChat.members);

    // remove self from array
    members.splice(members.indexOf(this.state.profile.username), 1);

    const menuWidth = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      // window's width - window's margin - margin
      outputRange: [ (this.state.size.width - sizes.windowMargin - 10) / 2, this.state.size.width - sizes.windowMargin - 10 ]
    });

    const menuHeight = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      // 65% of window's height
      outputRange: [ 0, this.state.size.height * 0.65 ]
    });

    const menuOpacity = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 0, 1 ]
    });

    const avatarOpacity = this.props.bottomSheetNode.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 1, 0 ]
    });

    const avatarWidth = this.props.bottomSheetNode.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ (sizes.avatar / 2), 0 ]
    });

    const avatarMarginLeft = this.props.bottomSheetNode.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ -(sizes.avatar / 2), (sizes.avatar / 2) ]
    });

    return (
      <View testID='v-menu' style={ styles.container }>
        <Animated.View style={ {
          ...styles.menu,

          width: menuWidth,
          height: menuHeight,

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
                <Image style={ styles.avatar } source={ this.state.profile.avatar }/>
              }
              {/* <Image style={ styles.avatar } source={ { uri: this.state.profile.avatar } }/> */}
            </Animated.View>

            {
              // TODO show the most relevant avatars
              members.splice(0, 2).map((id, i) =>
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
                      // eslint-disable-next-line security/detect-object-injection
                      source={ activeChat.avatars[id] }
                      // source={ { uri: activeChat.avatars[id] } }
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
    zIndex: depth.menuAvatar,

    minWidth: sizes.avatar,
    height: sizes.avatar
  },

  wrapper: {
    zIndex: depth.menuAvatar,

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
    zIndex: depth.menu,
    position: 'absolute',

    top: -5,
    right: 15,

    backgroundColor: colors.menuBackground,
    borderRadius: 15
  }
});

export default ChatAvatars;