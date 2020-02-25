import React from 'react';

import PropTypes from 'prop-types';

import { StyleSheet, View, Image } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

import Button from './Button.js';

import { getStore } from '../store.js';

import { sizes } from '../sizes';

import { depth } from '../depth.js';

import getTheme from '../colors.js';

/**
* @type { import('../store.js').default }
*/
let store;

const colors = getTheme();

const AnimatedImage = Animated.createAnimatedComponent(Image);

class ChatAvatars extends React.Component
{
  constructor()
  {
    super();

    // get store
    store = getStore('app');

    this.state = {
      menu: false,
      ...store.state
    };

    this.progress = new Animated.Value(0);

    // bind functions to use as callbacks
    this.onPress = this.onPress.bind(this);
  }
  
  componentDidMount()
  {
    store.subscribe(this);
  }

  componentWillUnmount()
  {
    store.unsubscribe(this);
  }

  onPress()
  {
    this.menu = this.menu ^ true;

    // control app's holder view
    store.set({ holder: this.menu });

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

  render()
  {
    const people = [
      require('../../assets/mockup/dina-0.jpg'),
      require('../../assets/mockup/sisi-0.jpg')
    ];

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

    const reverseAvatarOpacity = Animated.interpolate(this.props.bottomSheetNode, {
      inputRange: [ 0, 1 ],
      outputRange: [ 0, 1 ]
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
              {/* eslint-disable-next-line react-native/no-inline-styles */}
              <AnimatedImage style={ {
                ...styles.avatar,
                position: (people.length) ? 'absolute' : 'relative',
                opacity: reverseAvatarOpacity
              } } source={ require('../../assets/mockup/ker0olos.jpeg') }/>
    
              {
                people.map((source, i) =>
                {
                  return <Animated.View View key={ i } style={ {
                    ...styles.avatarContainer,
                    opacity: avatarOpacity,
                    width: (i === 0) ? sizes.avatar : avatarWidth
                  } }>
                    <AnimatedImage
                      // eslint-disable-next-line react-native/no-inline-styles
                      style={ {
                        ...styles.avatar,
                        marginLeft: (i === 0) ? 0 : avatarMarginLeft
                      } }
                      source={ source }
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
    height: sizes.avatar,
    borderRadius: sizes.avatar
  },

  avatar: {
    backgroundColor: colors.roundIconBackground,

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
