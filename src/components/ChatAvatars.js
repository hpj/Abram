import React from 'react';

import { StyleSheet, View, Image } from 'react-native';

import Button from './Button.js';

import getTheme from '../colors.js';

const colors = getTheme();

class ChatAvatars extends React.Component
{
  render()
  {
    const people = [
      // require('../../assets/mockup/dina-0.jpg'),
      // require('../../assets/mockup/sisi-0.jpg')
    ];

    return (
      <View style={ styles.container }>

        <Button
          buttonStyle={ styles.button }
          testID={ 'tb-options' }
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
  }
});

export default ChatAvatars;
