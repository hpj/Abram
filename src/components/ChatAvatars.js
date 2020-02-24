import React from 'react';

import PropTypes from 'prop-types';

import { StyleSheet, View, Image } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

import Button from './Button.js';

import { getStore } from '../store.js';

import { sizes } from '../sizes';

import getTheme from '../colors.js';

/**
* @type { import('../store.js').default }
*/
let store;

const colors = getTheme();

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
    const reverse = this.state.menu ^ true;

    // TODO
    this.setState({ menu: reverse });

    // control app's holder view
    store.set({ holder: reverse });

    Animated.timing(this.props.holderNode, {
      duration: 150,
      toValue: (reverse) ? 1 : 0,
      easing: Easing.linear
    }).start();
  }

  render()
  {
    const { menu } = this.state;
    
    const people = [
      // require('../../assets/mockup/dina-0.jpg'),
      // require('../../assets/mockup/sisi-0.jpg')
    ];

    const menuRect = {
      // offset the menu's top from the avatar's top
      top: (menu) ? -5 : 0,
      // negative (window's width + window's margin + avatar width + offset)
      left: (menu) ? -(this.state.size.width - sizes.windowMargin - sizes.avatar - 10) : 0,
      // window's width minus margin
      width: (menu) ? this.state.size.width - sizes.windowMargin : 0,
      // 65% of window's height
      height: (menu) ? this.state.size.height * 0.65 : 0
    };

    return (
      <View>
        <View style={ styles.container }>
          <View style={ {
            ...styles.menu,
            top: menuRect.top,
            left: menuRect.left,

            width: menuRect.width,
            height: menuRect.height
          } }
          />

          <Button
            testID={ 'tb-options' }
            buttonStyle={ styles.button }
            onPress={ this.onPress }
          >
            <Image style={ {
              ...styles.avatar,
              position: (people.length) ? 'absolute' : 'relative'
            } } source={ require('../../assets/mockup/ker0olos.jpeg') }/>
  
            {
              people.map((source, i) =>
              {
                return <Image
                  key={ i }
                  style={ (i === 0) ? styles.avatar : styles.mostlyAvatar }
                  source={ source }
                />;
              })
            }
          </Button>

        </View>
      </View>
    );
  }
}

ChatAvatars.propTypes = {
  holderNode: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
    minWidth: sizes.avatar,
    height: sizes.avatar
  },

  button: {
    zIndex: 5,
    flexDirection: 'row',

    minWidth: sizes.avatar,
    height: sizes.avatar,
    borderRadius: sizes.avatar
  },

  avatar: {
    backgroundColor: colors.roundIconBackground,
    
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: sizes.avatar
  },

  mostlyAvatar: {
    backgroundColor: colors.roundIconBackground,

    marginLeft: -(sizes.avatar/2),
    
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: sizes.avatar
  },

  menu: {
    zIndex: 4,
    position: 'absolute',

    backgroundColor: colors.menuBackground,
    borderRadius: 15
  }
});

export default ChatAvatars;
