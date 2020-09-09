import React from 'react';

import { StyleSheet, View, FlatList, TextInput, Text, Image } from 'react-native';

import { format, differenceInMinutes, differenceInDays, isToday, isYesterday } from 'date-fns';

import { Size, Keyboard, Profile, InboxEntry } from '../types';

import Button from '../components/Button';

import { sizes } from '../sizes';

import getTheme from '../colors';

import { StoreComponent } from '../store';

const colors = getTheme();

function relativeDate(messageTimestamp: Date, prevMessageTimestamp: Date): string | undefined
{
  let showTime = false;

  const date = new Date(messageTimestamp);

  // if this is the first message in the conversation
  if (!prevMessageTimestamp)
  {
    showTime = true;
  }
  else
  {
    // 5 minutes
    const maxDiff = 5;

    const prevMessageDate = new Date(prevMessageTimestamp);

    // if the difference between this message the the previous
    // is longer than the max minutes
    if (differenceInMinutes(date, prevMessageDate) > maxDiff)
      showTime = true;
  }

  if (!showTime)
    return;
  
  const baseDate = new Date();

  if (isToday(date))
    return format(date, '\'Today, \'hh:mm a');
  else if (isYesterday(date))
    return format(date, '\'Yesterday, \'hh:mm a');
  else if (differenceInDays(baseDate, date) <= 6)
    return format(date, 'EEEE\', \'hh:mm a');
  else
    return format(date, 'd MMMM yyyy, hh:mm a');
}

class Chat extends StoreComponent<unknown, {
  size: Size,
  keyboard: Keyboard,
  profile: Profile,
  activeChat: InboxEntry
}>
{
  render(): JSX.Element
  {
    const activeChat = this.state.activeChat;

    if (!activeChat.displayName)
      return <View/>;

    const messages = [ ...activeChat.messages ];

    const fieldHeight = (this.state.keyboard.height) ?
      (sizes.topBarHeight + sizes.windowMargin) :
      0;

    const viewHeight =
      this.state.size.height -
      this.state.keyboard.height -
      fieldHeight -
      (sizes.topBarHeight + sizes.topBarBigMargin);
    
    const bubbleWidth = this.state.size.width * sizes.chatBubbleMaxWidth;
    const bubbleTextWidth = bubbleWidth - (sizes.windowMargin * 2);
    const avatarBubbleTextWidth = bubbleTextWidth - sizes.chatAvatar - sizes.windowMargin;

    return (
      <View testID='v-chat' style={ {
        ...styles.container,
        height: viewHeight
      } }>
        <FlatList
          testID='v-messages'
          inverted={ true }
          data={ messages.reverse() }
          keyExtractor={ (item, index) => index.toString() }
          renderItem={ ({ item, index }) =>
          {
            const self = item.owner === this.state.profile.username;
            const avatar = (!self && activeChat.members.length > 2) ? activeChat.avatars[item.owner] : undefined;
            
            const time = relativeDate(item.timestamp, messages[index + 1]?.timestamp);
            
            return <View>
              {
                (time) ?
                  <Text style={ styles.time }>{ time }</Text> :
                  <View/>
              }

              {
                (avatar) ?
                  <View style={ { ...styles.message, maxWidth: bubbleWidth } }>
                    {
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      //@ts-ignore
                      <Image style={ styles.avatar } source={ avatar }/>
                    }
                    {/* <Image style={ styles.avatar } source={ { uri: avatar } }/> */}
                    <Text style={ { ...styles.text, maxWidth: avatarBubbleTextWidth } }>{ item.text }</Text>
                  </View> :

                  <View style={ { ...styles.message, ...((self) ? styles.messageAlt : undefined), maxWidth: bubbleWidth } }>
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
    alignSelf: 'flex-end'
  },

  message: {
    minWidth: 55,
    minHeight: 40,

    flexDirection: 'row',

    alignItems: 'center',
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
    alignSelf: 'flex-start',

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
