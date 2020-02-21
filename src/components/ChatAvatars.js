import React from 'react';

import { StyleSheet, View, Image } from 'react-native';

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

    // window's width minus margin
    const menuWidth = (menu) ? this.state.size.width - 40 : 0;

    // 65% of window's height
    const menuHeight = (menu) ? this.state.size.height * 0.65 : 0;

    const menuTop = (menu) ? -10 : 0;

    // negative window's width + margin + avatar width
    const menuLeft = (menu) ?  -this.state.size.width + 50 + 38 : 0;

    return (
      <View style={ styles.container }>

        <View style={ {
          ...styles.menu,
          top: menuTop,
          left: menuLeft,

          width: menuWidth,
          height: menuHeight
        } }>

        </View>

        <Button
          buttonStyle={ styles.button }
          testID={ 'tb-options' }
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

  menu: {
    zIndex: 3,
    position: 'absolute',

    backgroundColor: 'yellow',
    borderRadius: 15
  }
});

export default ChatAvatars;
