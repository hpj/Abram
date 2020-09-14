import React from 'react';

import { StyleSheet, View, FlatList, TextInput, Text, Image } from 'react-native';

import type { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native';

import { format, differenceInMinutes, differenceInDays, isToday, isYesterday } from 'date-fns';

import EmojiRegex from 'emoji-regex';

import { Size, Keyboard, Profile, InboxEntry, Message } from '../types';

import Button from '../components/Button';

import { sizes } from '../sizes';

import getTheme from '../colors';

import { StoreComponent } from '../store';

const colors = getTheme();

const emojiRegex = EmojiRegex();

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
  activeChat: InboxEntry,

  // not a store property
  inputs: Record<string, string>
}>
{
  constructor()
  {
    super();

    this.state = {
      ...this.state,
      inputs: {}
    };

    // bind functions to use as callbacks

    this.onChange = this.onChange.bind(this);

    this.sendMessage = this.sendMessage.bind(this);
  }

  strip(s: string): string
  {
    let striped = s;
    
    // filter emojis out of text
    striped = s.replace(emojiRegex, '');

    return striped;
  }

  sendMessage(): void
  {
    const  { profile, activeChat, inputs } = this.state;

    // strip and trim
    const value = this.strip(inputs[activeChat.id] ?? '').trim();

    if (value.length <= 0)
      return;

    const message: Message = {
      owner: profile.uuid,
      text: this.strip(value).trim(),
      timestamp: new Date()
    };

    // add message to UI
    activeChat.messages.push(message);
    
    // clear input value
    inputs[activeChat.id] = '';

    // update state
    this.setState({ inputs },
      // update store
      () =>  this.store.set({ activeChat }));
  }

  onChange(e: NativeSyntheticEvent<TextInputChangeEventData>): void
  {
    const { inputs, activeChat } = this.state;

    const text = e.nativeEvent.text;

    inputs[activeChat.id] = this.strip(text);

    this.setState({ inputs });
  }

  render(): JSX.Element
  {
    const { size, keyboard, profile, activeChat, inputs } = this.state;

    if (!activeChat.id)
      return <View/>;

    const value = inputs[activeChat.id] ?? '';

    const messages = [ ...activeChat.messages ];

    const fieldHeight = (keyboard.height) ?
      (sizes.topBarHeight + sizes.windowMargin) :
      0;

    const viewHeight =
      size.height -
      keyboard.height -
      fieldHeight -
      (sizes.topBarHeight + sizes.topBarBigMargin);
    
    const bubbleWidth = size.width * sizes.chatBubbleMaxWidth;
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
            const self = item.owner === profile.uuid;

            const avatar =
              (!self && activeChat.members.length > 2) ?
                activeChat.members.find(member => member.uuid === item.owner)?.avatar :
                undefined;
            
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
          width: size.width - (sizes.windowMargin * 2)
        } }>
          <TextInput
            style={ styles.field }
            multiline={ true }
            value={ value }
            onChange={ this.onChange }
            placeholderTextColor={ colors.placeholder }
            placeholder={ 'Write Message' }
          />
          <Button
            borderless={ true }
            buttonStyle={ styles.send }
            onPress={ this.sendMessage }
            icon={ { name: 'arrow-right', size: 18, color: value.length > 0 ? colors.whiteText : colors.greyText } }
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

    marginTop: sizes.windowMargin,
    marginBottom: sizes.windowMargin,

    fontSize: 13
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
