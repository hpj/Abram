import React from 'react';

import { StyleSheet, View, Image, TouchableWithoutFeedback } from 'react-native';

import Button from './Button.js';

import { getStore } from '../store.js';

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

    const menuRect ={
      // margin
      top: (menu) ? -5 : 0,
      // negative window's width + margin + avatar width
      left: (menu) ?  -this.state.size.width + 50 + 38 : 0,
      // window's width minus margin
      width: (menu) ? this.state.size.width - 40 : 0,
      // 65% of window's height
      height: (menu) ? this.state.size.height * 0.65 : 0
    };

    const holderRect ={
      // top bar margin + margin
      top: -(5 + 10),
      // negative window's width + avatar width + top bar margin
      left: -this.state.size.width + 38 + 20,
      // window width
      width: this.state.size.width,
      // window height
      height: this.state.size.height
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
    // backgroundColor: 'green',
    minWidth: 38,
    height: 38
  },

  button: {
    zIndex: 3,
    flexDirection: 'row',

    minWidth: 38,
    height: 38,
    borderRadius: 38
  },

  avatar: {
    backgroundColor: colors.roundIconBackground,
    
    width: 38,
    height: 38,
    borderRadius: 38
  },

  mostlyAvatar: {
    backgroundColor: colors.roundIconBackground,

    marginLeft: -(38/2),
    
    width: 38,
    height: 38,
    borderRadius: 38
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
