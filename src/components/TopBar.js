import React from 'react';

import { StyleSheet, View, Text } from 'react-native';

import { RFValue } from 'react-native-responsive-fontsize';

import Button from './Button.js';

import getTheme from '../colors.js';

const colors = getTheme();

class TopBar extends React.Component
{
  render()
  {
    return (
      <View style={ styles.wrapper }>
        <View style={ styles.container }>
          <Text style={ styles.title }>
            Inbox
          </Text>

          <View style={ styles.controls }>
            <Button
              testID={ 'tb-search' }
              backgroundStyle={ styles.controlBackground }
              buttonStyle={ styles.control }
              icon={ { name: 'search', size: 24, color: colors.whiteText } }
              // onPress={ () => this.setIndex(0) }
            />
          </View>

          <View style={ styles.avatars }>
            <Button
              testID={ 'tb-options' }
              image={ { source: require('../../assets/mockup/ker0olos.jpeg'), style: styles.avatar } }
              // onPress={ () => this.setIndex(0) }
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    height: 52,
    backgroundColor: colors.whiteBackground
  },

  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginRight: 20
  },

  title: {
    flex: 1,
    color: colors.whiteText,
    fontWeight: 'bold',
    fontSize: RFValue(38, 1130)
  },

  controls: {
    backgroundColor: 'purple',
    marginLeft: 15,
    marginRight: 15
  },

  control: {
    alignItems: 'center',
    justifyContent: 'center',

    width: 38,
    height: 38
  },

  controlBackground: {
    position: 'absolute',

    backgroundColor: colors.roundIconBackground,
    
    width: 38,
    height: 38,
    borderRadius: 38
  },

  avatars: {
    backgroundColor: 'blue'
  },

  avatar: {
    backgroundColor: colors.roundIconBackground,
    
    width: 38,
    height: 38,
    borderRadius: 38
  }
});

export default TopBar;
