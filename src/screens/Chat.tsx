import React from 'react';

import { StyleSheet, View, FlatList, TextInput, Text, Image } from 'react-native';

import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

import { isToday, differenceInMinutes, isSameDay } from 'date-fns';

import EmojiRegex from 'emoji-regex';

import type { Size, Keyboard, Profile, InboxEntry, Message } from '../types';

import ChatContext from '../components/ChatContext';

import Button from '../components/Button';

import * as utils from '../utils';

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

    // messages are on a different days
    if (!isSameDay(messageTimestamp, prevMessageDate))
      showTime = true;

    // messages are from today but have a [max] minutes between them
    else if (isToday(messageTimestamp) && differenceInMinutes(date, prevMessageDate) > maxDiff)
      showTime = true;
  }

  if (!showTime)
    return;

  return utils.relativeDate(date, false);
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

  messages: Message[] = [];

  stateWillChange({ activeChat }: Chat['state']): void
  {
    // TODO limit the number of messages using the backend, so this won't slow performance much
    
    // reverse happens because the way flat-list works
    this.messages = activeChat?.messages?.concat().reverse();
  }

  stateWhitelist(changes: Chat['state']): boolean
  {
    if (
      changes.size ||
      changes.keyboard ||
      changes.profile ||
      changes.activeChat
    )
      return true;
    
    return false;
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

  onPress(message: Message): void
  {
    if (this.store.state.popup)
      return;
    
    // open a popup containing the chat context
    this.store.set({
      popup: true,
      popupContent: () => <ChatContext activeChat={ this.state.activeChat } message={ message }/>
    });
  }

  onChange(text: string): void
  {
    const { inputs, activeChat } = this.state;

    inputs[activeChat.id] = this.strip(text);

    this.setState({ inputs });
  }

  render(): JSX.Element
  {
    const { size, keyboard, profile, activeChat, inputs } = this.state;

    if (!activeChat?.id)
      return <View/>;

    const value = inputs[activeChat.id] ?? '';

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

    return <View testID={ 'v-chat' } style={ {
      ...styles.container,
      height: viewHeight
    } }>
      <FlatList
        testID={ 'v-messages' }
        inverted={ true }
        data={ this.messages }
        keyExtractor={ (item, index) => index.toString() }
        renderItem={ ({ item, index }) =>
        {
          const self = item.owner === profile.uuid;

          const avatar =
              (!self && activeChat.members.length > 2) ?
                activeChat.members.find(member => member.uuid === item.owner)?.avatar :
                undefined;
            
          const time = relativeDate(item.timestamp, this.messages[index + 1]?.timestamp);
            
          return <View>
            {
              (time) ?
                <Text style={ styles.time }>{ time }</Text> :
                <View/>
            }

            {
              (avatar) ?
                <TouchableWithoutFeedback
                  testID={ 'bn-context' }
                  style={ { ...styles.message, maxWidth: bubbleWidth } }
                  onPress={ () => this.onPress(item) }
                >
                  {/* @ts-ignore */}
                  <Image style={ styles.avatar } source={ avatar }/>
                  {/* <Image style={ styles.avatar } source={ { uri: avatar } }/> */}
                  <Text style={ { ...styles.text, maxWidth: avatarBubbleTextWidth } }>{ item.text }</Text>
                </TouchableWithoutFeedback> :

                <TouchableWithoutFeedback
                  testID={ 'bn-context' }
                  style={ { ...styles.message, ...(self ? styles.messageAlt : undefined), maxWidth: bubbleWidth } }
                  onPress={ () => this.onPress(item) }
                >
                  <Text style={ { ...styles.text, maxWidth: bubbleTextWidth } }>{ item.text }</Text>
                </TouchableWithoutFeedback>
            }
          </View>;
        } }
      />

      <View style={ {
        ...styles.input,
        width: size.width - (sizes.windowMargin * 2)
      } }>
        <TextInput
          testID={ 'in-message' }
          style={ styles.field }
          multiline={ true }
          value={ value }
          onChangeText={ this.onChange }
          placeholderTextColor={ colors.placeholder }
          placeholder={ 'Write Message' }
        />
        <Button
          testID={ 'bn-message' }
          borderless={ true }
          buttonStyle={ styles.send }
          onPress={ this.sendMessage }
          icon={ { name: 'arrow-right', size: 18, color: value.length > 0 ? colors.whiteText : colors.greyText } }
        />
      </View>

    </View>;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.blackBackground
  },

  time: {
    textAlign: 'center',
    color: colors.greyText,

    marginHorizontal: sizes.windowMargin * 2,

    marginTop: sizes.windowMargin * 2,
    marginBottom: sizes.windowMargin * 0.35,

    fontSize: 12
  },

  messageAlt: {
    backgroundColor: colors.messageBackground,

    borderWidth: 0,

    minWidth: 55 + (4 * 2) + 10,
    minHeight: 40 + (4 * 2) + 1.5,

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
    borderColor: colors.messageBackground,
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
    backgroundColor: colors.messageBackground,
    
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
    height: sizes.topBarHeight,
    
    marginLeft: sizes.windowMargin / 4,
    marginRight: sizes.windowMargin / 2,

    borderRadius: sizes.avatar
  }
});

export default Chat;
