import React from 'react';

import { StyleSheet, ScrollView, View, Text } from 'react-native';

// import Icon from 'react-native-vector-icons/Feather';

import type { Profile } from '../types';

import getTheme from '../colors';

import { sizes } from '../sizes';

import Button from './Button';

// import { pronoun, sharedInterests } from '../utils';

const colors = getTheme();

export class AvatarEdits extends React.Component
{
  render(): JSX.Element
  {
    return <View style={ styles.section }>
      <View style={ styles.space }/>
    </View>;
  }
}

export class RomanticEdits extends React.Component<{
  initial: Profile['info']['romantically']
}, {
  current: Profile['info']['romantically']
}>
{
  constructor(props: RomanticEdits['props'])
  {
    super(props);

    this.state = {
      current: props.initial
    };
  }

  render(): JSX.Element
  {
    const { current } = this.state;

    return <View style={ styles.section }>
      <Text style={ styles.title }>{ 'Choose Your Romantic Availability ' }</Text>

      <Text style={ styles.text }>
        <Text>While being </Text>
        <Text style={ { color: colors.whiteText } }>Romantically Closed, </Text>
        <Text>Reporting any user for flirting will result in their account getting </Text>
        <Text style={ { color: colors.brightRed } }>Terminated</Text>
        <Text>.</Text>
      </Text>

      <View style={ styles.space }/>

      <Button
        text={ 'Open' }
        buttonStyle={ styles.toggle }
        icon={ current === 'Open' ? { name: 'check', size: sizes.icon * 0.65, color: colors.whiteText } : undefined }
        textStyle={ { ...styles.toggleText, color: current === 'Open' ? colors.whiteText : colors.greyText } }
        onPress={ () => this.setState({ current: 'Open' }) }
      />

      <Button
        text={ 'Closed' }
        buttonStyle={ styles.toggle }
        icon={ current === 'Closed' ? { name: 'check', size: sizes.icon * 0.65, color: colors.whiteText } : undefined }
        textStyle={ { ...styles.toggleText, color: current === 'Closed' ? colors.whiteText : colors.greyText } }
        onPress={ () => this.setState({ current: 'Closed' }) }
      />

      <View style={ styles.buttons }>
        <Button
          text={ 'Cancel' }
          borderless={ true }
          buttonStyle={ styles.button }
          textStyle={ styles.buttonText }
        />

        <Button
          text={ 'Save' }
          borderless={ true }
          buttonStyle={ styles.button }
          textStyle={ styles.buttonText }
        />
      </View>
    </View>;
  }
}

const styles = StyleSheet.create({
  section: {
    margin: sizes.windowMargin
  },

  title: {
    fontSize: 12,
    color: colors.greyText,
    fontWeight: 'bold',

    textTransform: 'uppercase'
  },

  space: {
    margin: sizes.windowMargin * 0.5
  },

  text: {
    fontSize: 12,
    color: colors.greyText,
    fontWeight: 'bold',

    marginVertical: sizes.windowMargin * 0.5
  },

  toggle: {
    flexDirection: 'row-reverse',
    alignItems: 'center',

    padding: sizes.windowMargin * 0.75
  },

  toggleText: {
    flexGrow: 1,
    fontSize: 14,
    fontWeight: 'bold'
  },

  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },

  button: {
    paddingHorizontal: sizes.windowMargin * 1.25,
    paddingVertical: sizes.windowMargin * 0.5
  },

  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.greyText
  }
});