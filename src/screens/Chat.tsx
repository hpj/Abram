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

function relativeDate(currMessageDate: Date, prevMessageDate: Date): string | undefined
{
  let showTime = false;

  // if this is the first message in the conversation
  if (!prevMessageDate)
  {
    showTime = true;
  }
  else
  {
    // 5 minutes
    const maxDiff = 5;

    // messages are on a different days
    if (!isSameDay(currMessageDate, prevMessageDate))
      showTime = true;

    // messages are from today but have a [max] minutes between them
    else if (isToday(currMessageDate) && differenceInMinutes(currMessageDate, prevMessageDate) > maxDiff)
      showTime = true;
  }

  if (!showTime)
    return;

  return utils.relativeDate(currMessageDate, false);
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

  hints: JSX.Element[] = [];

  messages: Message[] = [];

  stateWillChange({ activeChat, profile }: Chat['state']): void
  {
    // TODO limit the number of messages using the backend, so this won't slow performance much
      
    if (activeChat?.id && activeChat?.id !== this.state.activeChat?.id)
    {
      this.hints = [];

      const members = [ ...activeChat.members ];

      // remove self from array
      members.splice(
        members.findIndex(member => member.uuid === profile.uuid), 1);

      const shared = utils.sharedInterests(profile, ...members)
        .shared
        .slice(0, 6)
        .join(', ');

      // show a greeting
      this.hints.push(<Text style={ styles.hint }>{ `Hey, ${profile.nickname}.` }</Text>);

      // 1 on 1 chats hints
      if (activeChat.members.length === 2)
      {
        const user = members[0];
  
        // show nickname preference
        this.hints.push(<Text style={ styles.hint }>
          <Text>{ user.fullName + ' prefers to be called ' }</Text>
          <Text style={ styles.hintBold }>{ user.nickname }</Text>
          <Text>.</Text>
        </Text>);

        // interests
        if (shared.length > 0)
        {
          this.hints.push(<Text style={ styles.hint }>
            <Text>Your shared interests are </Text>
            <Text style={ { ...styles.hintSlim, ...styles.hintBold } }>{ shared }</Text>
            <Text>.</Text>
          </Text>);
        }

        // questions
        if (user.iceBreakers?.length > 1)
        {
          this.hints.push(
            <Text style={ styles.hint }>{ `You can start the conversation by asking one of those questions ${user.nickname} likes:` }</Text>,
            ...user.iceBreakers.map((question, i) => <Text key={ i } style={ { ...styles.hintSlim, ...styles.hintBold } }>{ `- ${question}` }</Text>),
            <Text style={ styles.hint }></Text>
          );
        }
      }
      else if (activeChat.members.length > 2)
      // group chats hints
      {
        const nicknames = members.map(member => member.nickname).join(', ');
        
        // show nicknames
        this.hints.push(<Text style={ styles.hint }>
          <Text>This is a group chat with </Text>
          <Text style={ styles.hintBold }>{ nicknames }</Text>
          <Text>.</Text>
        </Text>);

        // interests
        if (shared.length > 0)
        {
          this.hints.push(<Text style={ styles.hint }>
            <Text>Your shared interests are </Text>
            <Text style={ { ...styles.hintSlim, ...styles.hintBold } }>{ shared }</Text>
            <Text>.</Text>
          </Text>);
        }
      }
    }

    // reverse happens because the way flat-list works
    if (activeChat?.messages)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.messages = [ ...this.hints, ...activeChat.messages ].reverse();
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
      createdAt: new Date()
    };

    // update the last active timestamp
    activeChat.updatedAt = message.createdAt;

    // add message to UI
    activeChat.messages.push(message);
    
    // clear input value
    inputs[activeChat.id] = '';

    // update state
    this.setState({ inputs },
      // update store
      () => this.store.set({ activeChat }));
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

    const renderMessage = ({ item, index }: { item: Message, index: number }) =>
    {
      if (!item.owner)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return React.cloneElement(item as any, { key: index });
      
      const message = item as Message;

      const self = message.owner === profile.uuid;

      const avatar =
          (!self && activeChat.members.length > 2) ?
            activeChat.members.find(member => member.uuid === message.owner)?.avatar :
            undefined;
        
      const time = relativeDate(message.createdAt, this.messages[index + 1]?.createdAt);
        
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
              onPress={ () => this.onPress(message) }
            >
              {/* @ts-ignore */}
              <Image style={ styles.avatar } source={ avatar }/>
              {/* <Image style={ styles.avatar } source={ { uri: avatar } }/> */}
              <Text style={ { ...styles.text, maxWidth: avatarBubbleTextWidth } }>{ message.text }</Text>
            </TouchableWithoutFeedback> :

            <TouchableWithoutFeedback
              testID={ 'bn-context' }
              style={ { ...styles.message, ...(self ? styles.messageAlt : undefined), maxWidth: bubbleWidth } }
              onPress={ () => this.onPress(message) }
            >
              <Text style={ { ...styles.text, maxWidth: bubbleTextWidth } }>{ message.text }</Text>
            </TouchableWithoutFeedback>
        }
      </View>;
    };

    return <View testID={ 'v-chat' } style={ {
      ...styles.container,
      height: viewHeight
    } }>
      <FlatList
        testID={ 'v-messages' }
        inverted={ true }
        data={ this.messages }
        keyExtractor={ (item, index) => index.toString() }
        renderItem={ renderMessage }
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

  hint: {
    color: colors.greyText,
    fontSize: 13,

    marginBottom: sizes.windowMargin * 1.5,
    marginHorizontal: sizes.windowMargin * 1.25
  },
  
  hintSlim: {
    color: colors.greyText,
    fontSize: 13,

    marginVertical: sizes.windowMargin * 0.15,
    marginHorizontal: sizes.windowMargin * 1.25
  },

  hintBold: {
    color: colors.greyText,
    fontWeight: 'bold',
    fontSize: 13
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
