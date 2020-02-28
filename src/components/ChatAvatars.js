import React from 'react';

import PropTypes from 'prop-types';

import { StyleSheet, View, Image } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

import Button from './Button.js';

import { StoreComponent } from '../store.js';

import { sizes } from '../sizes';

import { depth } from '../depth.js';

import getTheme from '../colors.js';

const colors = getTheme();

const AnimatedImage = Animated.createAnimatedComponent(Image);

class ChatAvatars extends StoreComponent
{
  constructor()
  {
    super(undefined, {
      menu: false
    });

    this.progress = new Animated.Value(0);

    // bind functions to use as callbacks
    this.onPress = this.onPress.bind(this);
  }

  onPress()
  {
    this.menu = this.menu ^ true;

    // control app's holder view
    this.store.set({ holder: this.menu });

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
  }

  values(obj)
  {
    if (!obj)
      return [];

    // eslint-disable-next-line security/detect-object-injection
    return Object.keys(obj).map((k) => obj[k]);
  }

  render()
  {
    const activeEntry = this.state.activeEntry;

    const avatars = Object.keys(activeEntry.avatars || {});

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
      // 65% of window's height
      outputRange: [ 0, 1 ]
    });

    const avatarOpacity = Animated.interpolate(this.props.bottomSheetNode, {
      inputRange: [ 0, 1 ],
      outputRange: [ 1, 0 ]
    });

    const avatarWidth = Animated.interpolate(this.props.bottomSheetNode, {
      inputRange: [ 0, 1 ],
      outputRange: [ (sizes.avatar / 2), 0 ]
    });

    const avatarMarginLeft = Animated.interpolate(this.props.bottomSheetNode, {
      inputRange: [ 0, 1 ],
      outputRange: [ -(sizes.avatar / 2), (sizes.avatar / 2) ]
    });

    return (
      <View>
        <View style={ styles.container }>
          <Animated.View style={ {
            ...styles.menu,

            width: menuWidth,
            height: menuHeight,

            opacity: menuOpacity
          } }
          />

          <View style={ styles.wrapper }>
            <Button
              testID={ 'tb-options' }
              borderless={ true }
              buttonStyle={ styles.button }
              onPress={ this.onPress }
            >
              <Animated.View style={ styles.avatarContainer }>
                <AnimatedImage style={ styles.avatar } source={ this.state.profile.avatar }/>
              </Animated.View>
              {
                // TODO show the most relevant avatars
                avatars.splice(0, 2).map((id, i) =>
                {
                  return <Animated.View key={ i } style={ {
                    ...styles.avatarContainer,
                    opacity: avatarOpacity,
                    width: avatarWidth
                  } }>
                    <AnimatedImage
                      style={ {
                        ...styles.avatar,
                        marginLeft: avatarMarginLeft
                      } }
                      // eslint-disable-next-line security/detect-object-injection
                      source={ activeEntry.avatars[id] }
                    />
                  </Animated.View>;
                })
              }
            </Button>
          </View>

        </View>
      </View>
    );
  }
}

ChatAvatars.propTypes = {
  holderNode: PropTypes.object,
  bottomSheetNode: PropTypes.object
};

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
