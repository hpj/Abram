import React from 'react';

import { StyleSheet, View, TextInput, Text } from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';

import Button from '../components/Button.js';

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

          <View style={ styles.message }>
            <Text style={ styles.text }>{ '.' }</Text>
          </View>

          <View style={ styles.messageAlt }>
            <Text style={ styles.text }>{ '.' }</Text>
          </View>
          
        </ScrollView>

        <View style={ {
          ...styles.input,
          width: this.state.size.width - (sizes.windowMargin * 2)
        } }>
          <TextInput style={ styles.field }
            multiline={ true }
            placeholderTextColor={ colors.placeholder }
            placeholder={ 'Write Message' }
          />
          <Button
            borderless={ true }
            buttonStyle={ styles.send }
            icon={ { name: 'arrow-right', size: 18, color: colors.greyText } }
          />
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.blackBackground,

    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin
  },

  messages: {
    flexDirection: 'column-reverse'
  },

  message: {
    minWidth: 70,
    maxWidth: '85%',
    minHeight: 45,

    alignItems: 'center',
    justifyContent: 'center',

    alignSelf: 'flex-start',
    marginTop: 10,

    borderWidth: 3,
    borderColor: colors.messageBubble,
    borderRadius: 25
  },

  messageAlt: {
    minWidth: 70,
    maxWidth: '85%',
    minHeight: 45,

    alignItems: 'center',
    justifyContent: 'center',

    alignSelf: 'flex-end',
    backgroundColor: colors.messageBubble,

    marginTop: 10,
    borderRadius: 25
  },

  text: {
    // backgroundColor: 'red',
    color: colors.text,

    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,

    fontSize: 16
  },

  input: {
    flexDirection: 'row',
    backgroundColor: colors.messageBubble,
    
    height: sizes.topBarHeight,

    marginTop: sizes.windowMargin * 1.5,
    marginBottom: sizes.windowMargin / 2,
    
    borderRadius: sizes.topBarHeight
  },

  field: {
    flex: 1,

    color: colors.whiteText,
    fontSize: 16,

    marginTop: sizes.windowMargin / 4,
    marginBottom: sizes.windowMargin / 4,
    
    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin / 4
  },

  send: {
    alignItems: 'center',
    justifyContent: 'center',

    width: sizes.avatar,

    marginTop: sizes.windowMargin / 2,
    marginBottom: sizes.windowMargin / 2,
    
    marginLeft: sizes.windowMargin / 4,
    marginRight: sizes.windowMargin / 2,

    borderRadius: sizes.avatar
  }
});

export default Chat;
