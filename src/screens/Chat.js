import React from 'react';

import { StyleSheet, View, ScrollView, TextInput } from 'react-native';

import { sizes, screen } from '../sizes.js';

import getTheme from '../colors.js';

const colors = getTheme();

class Chat extends React.Component
{
  render()
  {
    return (
      <View style={ styles.container }>
        <ScrollView style={ styles.messages }>

          <View style={ { ...styles.message, backgroundColor: 'green' } }>

          </View>

          <View style={ { ...styles.message, backgroundColor: 'red' } }>

          </View>

        </ScrollView>

        <View style={ styles.input }>
          <TextInput style={ styles.field }
            placeholderTextColor={ colors.placeholder }
            placeholder={ 'Write Message' }
          />
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'orange',
    height: screen.height - (sizes.topBarHeight + sizes.topBarBigMargin)
  },

  messages: {

  },

  message: {
    height: 500
  },

  input: {
    backgroundColor: 'purple',

    // backgroundColor: colors.messageBubble,
    width: screen.width - (sizes.windowMargin * 2),

    marginTop: 10,
    marginBottom: 10,
    
    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin,
    
    borderRadius: sizes.topBarHeight
  },

  field: {
    color: colors.whiteText,

    height: sizes.topBarHeight,

    fontSize: 16,

    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin
  }
});

export default Chat;
