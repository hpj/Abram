import React from 'react';

import { StyleSheet, View, Text, ViewStyle } from 'react-native';

import { Feather as Icon } from '@expo/vector-icons';

import getTheme from '../colors';

import { sizes } from '../sizes';

const colors = getTheme();

const InfoBox = ({ style, fontSize, text }: { style?: ViewStyle, fontSize?: number, text: string }): JSX.Element =>
{
  return <View style={ { ...styles.container, ...style } }>
    <Icon name={ 'alert-triangle' } size={ sizes.icon * 0.75 } color={ colors.whiteText } style={ styles.icon }/>
    <Text style={ { ...styles.text, fontSize: fontSize ?? styles.text.fontSize } }>{ text }</Text>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: colors.rectangleBackground,
    padding: sizes.windowMargin * 0.75,
    borderRadius: 5
  },

  text: {
    flex: 1,
    color: colors.whiteText,
    opacity: 0.65,

    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },

  icon: {
    opacity: 0.65,
    marginRight: sizes.windowMargin * 0.75
  }
});

export default InfoBox;
