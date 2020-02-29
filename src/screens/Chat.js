import React from 'react';

import { StyleSheet, View, FlatList, TextInput, Text, Image } from 'react-native';

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

    const viewHeight =
      this.state.size.height -
      this.state.keyboard.height -
      fieldHeight -
      (sizes.topBarHeight + sizes.topBarBigMargin);
    
    const data = [
      {
        source: require('../../assets/mockup/dina-0.jpg'),
        text: 'All that was said All that was said All that was said All that was said All that was said All that was said  All that was said'
      },
      {
        source: require('../../assets/mockup/dina-0.jpg'),
        text: '.'
      },
      {
        text: '.'
      },
      {
        text: 'All that was said All that was said All that was said All that was said All that was said All that was said  All that was said'
      },
      {
        self: true,
        text: '.'
      }
    ];

    const bubbleWidth = this.state.size.width * sizes.chatBubbleMaxWidth;
    const bubbleTextWidth = bubbleWidth - (sizes.windowMargin * 2);
    const avatarBubbleTextWidth = bubbleTextWidth - sizes.chatAvatar - sizes.windowMargin;

    return (
      <View style={ {
        ...styles.container,
        height: viewHeight
      } }>
        <FlatList
          inverted={ true }
          data={ data.reverse() }
          keyExtractor={ (item, index) => index.toString() }
          renderItem={ ({ item, index }) =>
          {
            
            return <View>
              {
                (index === data.length - 1) ?
                  <Text style={ styles.time }>{ '2019/12/12, 07:07 AM' }</Text> :
                  <View/>
              }

              {
                (item.source) ?

                  <View style={ { ...styles.message, maxWidth: bubbleWidth } }>
                    <Image style={ styles.avatar } source={ item.source }/>
                    <Text style={ { ...styles.text, maxWidth: avatarBubbleTextWidth } }>{ item.text }</Text>
                  </View> :

                  <View style={ { ...styles.message, ...((item.self) ? styles.messageAlt : undefined), maxWidth: bubbleWidth } }>
                    <Text style={ { ...styles.text, maxWidth: bubbleTextWidth } }>{ item.text }</Text>
                  </View>
              }
            </View>;
          } }
        />

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
    backgroundColor: colors.blackBackground
  },

  time: {
    color: colors.greyText,
    textAlign: 'center',

    marginTop: sizes.windowMargin / 2,
    marginBottom: sizes.windowMargin / 2,

    fontSize: 14
  },

  messageAlt: {
    backgroundColor: colors.messageBubble,
    alignSelf: 'flex-end',
    borderWidth: 0
  },

  message: {
    minWidth: 55,
    minHeight: 40,

    flexDirection: 'row',
    justifyContent: 'center',

    alignSelf: 'flex-start',

    marginTop: 10,
    marginBottom: 5,
    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin,

    paddingVertical: sizes.windowMargin / 2,

    borderWidth: 3,
    borderColor: colors.messageBubble,
    borderRadius: 25
  },

  text: {
    color: colors.text,

    fontSize: 16,

    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin
  },

  avatar: {
    width: sizes.chatAvatar,
    height: sizes.chatAvatar,
    borderRadius: sizes.chatAvatar,

    marginLeft: sizes.windowMargin
  },

  input: {
    flexDirection: 'row',
    backgroundColor: colors.messageBubble,
    
    height: sizes.topBarHeight,
    
    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin,
    marginTop: sizes.windowMargin / 2,
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
