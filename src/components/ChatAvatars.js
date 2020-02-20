import React from 'react';

import { StyleSheet, View } from 'react-native';

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
          testID={ 'tb-options' }
          image={ { source: require('../../assets/mockup/ker0olos.jpeg'), style: styles.user } }
        />

        <View style={ styles.chat }>
          {
            people.map((source, i) =>
            {
              return <Button
                key={ i }
                testID={ 'tb-options' }
                image={ { source: source, style: (i === 0) ? styles.avatar : styles.mostlyAvatar } }
              />;
            })
          }
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'green',
    minWidth: 38,
    height: 38
  },

  user: {
    position: 'absolute',
    backgroundColor: colors.roundIconBackground,
    
    width: 38,
    height: 38,
    borderRadius: 38
  },

  chat: {
    flexDirection: 'row'
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
