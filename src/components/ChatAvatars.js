import React from 'react';

import { StyleSheet, View, Image, TouchableWithoutFeedback } from 'react-native';

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
    store = getStore('app').mount(this);
  }
  
  componentDidMount()
  {
    store.subscribe(this);
  }

  componentWillUnmount()
  {
    store.unsubscribe(this);
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
      left: (menu) ? -(this.state.size.width - (sizes.windowMargin * 2) - sizes.avatar - 5) : 0,
      // window's width minus margin
      width: (menu) ? this.state.size.width - (sizes.windowMargin * 2) : 0,
      // 65% of window's height
      height: (menu) ? this.state.size.height * 0.65 : 0
    };

    const holderRect = {
      // the difference between the menu current and the top of the app window
      // negative (top bar height + avatar width + buffer)
      top: -(sizes.topBarHeight - sizes.avatar - 5),
      // the difference between the menu current and the left side of the app window
      // negative (window's width + avatar width + window margin + buffer)
      left: -this.state.size.width + sizes.avatar + sizes.windowMargin - 5,
      // window width + buffer
      width: this.state.size.width + 10,
      // window height + buffer
      height: this.state.size.height + 10
    };

    const holderOpacity = (menu) ? 0.65 : 0;

    return (
      <View style={ styles.wrapper }>

        <TouchableWithoutFeedback
          onPress={ () => this.setState({ menu: false }) }
        >
          <View style={ {
            ...styles.holder,
            top: holderRect.top,
            left: holderRect.left,
            width: holderRect.width,
            height: holderRect.height,

            opacity: holderOpacity
          } }
          pointerEvents={ (menu) ? 'box-only' : 'none' }/>
        </TouchableWithoutFeedback>

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
            onPress={ () => this.setState({ menu: menu ^ true }) }
          >
            {/* eslint-disable-next-line react-native/no-inline-styles */}
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

const styles = StyleSheet.create({
  container: {
    zIndex: 3,

    minWidth: sizes.avatar,
    height: sizes.avatar
  },

  button: {
    zIndex: 3,
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

  holder: {
    zIndex: 3,
    position: 'absolute',

    backgroundColor: colors.blackBackground
  },

  menu: {
    zIndex: 3,
    position: 'absolute',

    backgroundColor: colors.menuBackground,
    borderRadius: 15
  }
});

export default ChatAvatars;
