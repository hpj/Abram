import React from 'react';

import { StyleSheet, View } from 'react-native';

import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

import Text from './Text.js';

import getTheme from '../colors.js';

const colors = getTheme();

class TopBar extends React.Component
{
  render()
  {
    return (
      <View style={ styles.wrapper }>
        <View style={ styles.container }>
          <Text text={ 'Inbox' } viewStyle={ styles.title } textStyle={ styles.titleText }/>

          <View style={ styles.controls }>
            <View style={ styles.control }>
            </View>
          </View>

          <View style={ styles.avatars }>
            <View style={ styles.avatar }>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    height: 56,
    backgroundColor: colors.whiteBackground
  },

  container: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20
  },

  title: {
    flex: 1,
    justifyContent: 'center'
  },

  titleText: {
    color: colors.whiteText,
    fontWeight: 'bold',
    fontSize: RFValue(38, 1130)
  },

  controls: {
    backgroundColor: 'purple'
  },

  control: {
    width: 48
  },

  avatars: {
    backgroundColor: 'blue'
  },

  avatar: {
    width: 48
  }
});

export default TopBar;
