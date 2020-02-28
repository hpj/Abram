import React from 'react';

import { StyleSheet, View, ScrollView, TextInput } from 'react-native';

import { sizes } from '../sizes.js';

import getTheme from '../colors.js';

import { StoreComponent } from '../store.js';

const colors = getTheme();

class Chat extends StoreComponent
{
  render()
  {
    const fieldHeight = (this.state.keyboard.height) ?
      (sizes.topBarHeight + sizes.windowMargin) :
      0;
    
    return (
      <View style={ {
        ...styles.container,
        height: (this.state.size.height - this.state.keyboard.height - fieldHeight) - (sizes.topBarHeight + sizes.topBarBigMargin)
      } }>
        <ScrollView style={ styles.messages }>

          <View style={ { ...styles.message, backgroundColor: 'green' } }>

          </View>

          <View style={ { ...styles.message, backgroundColor: 'red' } }>

          </View>

        </ScrollView>

        <View style={ {
          ...styles.input,
          width: this.state.size.width - (sizes.windowMargin * 2)
        } }>
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
    backgroundColor: 'yellow'
  },

  messages: {
    backgroundColor: 'orange'
  },

  message: {
    height: 100
  },

  input: {
    backgroundColor: 'purple',

    height: sizes.topBarHeight,

    // backgroundColor: colors.messageBubble,

    marginTop: sizes.windowMargin / 2,
    marginBottom: sizes.windowMargin / 2,
    
    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin,
    
    borderRadius: sizes.topBarHeight
  },

  field: {
    flex: 1,

    color: colors.whiteText,
    fontSize: 16,

    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin
  }
});

export default Chat;
