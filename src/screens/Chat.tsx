import React from 'react';

import { StyleSheet, Keyboard, View, FlatList, TextInput, Text } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

import { isToday, differenceInMilliseconds, isSameDay } from 'date-fns';

import EmojiRegex from 'emoji-regex';

import type { Size, Profile, InboxEntry, Message } from '../types';

import ChatHints from '../components/ChatHints';

import ChatMessage from '../components/ChatMessage';

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
    const maxDiff = 5 * 60 * 1000;

    // messages are on a different days
    if (!isSameDay(currMessageDate, prevMessageDate))
      showTime = true;

    // messages are from today but have a [max] minutes between them
    else if (isToday(currMessageDate) && differenceInMilliseconds(currMessageDate, prevMessageDate) >= maxDiff)
      showTime = true;
  }

  if (!showTime)
    return;

  return utils.relativeDate(currMessageDate, false);
}

class Chat extends StoreComponent<unknown, {
  size: Size,
  inputs: Record<string, string>,
  profile: Profile,
  activeChat: InboxEntry
}>
{
  constructor()
  {
    super();

    // bind functions to use as callbacks

    this.onChange = this.onChange.bind(this);
    
    this.keyboardShow = this.keyboardShow.bind(this);
    this.keyboardHide = this.keyboardHide.bind(this);

    this.sendMessage = this.sendMessage.bind(this);
  }

  hints: JSX.Element | undefined = undefined;

  messages: Message[] = [];

  stateWillChange({ inputs, activeChat, profile }: Chat['state']): Partial<Chat['state']> | undefined
  {
    // TODO limit the number of messages using the backend, so this won't slow performance much

    if (activeChat?.id && activeChat?.id !== this.state.activeChat?.id)
    {
      const members = [ ...activeChat.members ];

      // remove self from array
      members.splice(
        members.findIndex(member => member.uuid === profile.uuid), 1);

      this.hints = <ChatHints user={ profile } profiles={ members }/>;
    }

    // reverse happens because the way flat-list works
    if (activeChat?.messages)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.messages = [ this.hints, ...activeChat.messages ].reverse();

    // new input value
    if (inputs && this.state.activeChat?.id)
    {
      // strip input value of unwanted characters
      inputs[this.state.activeChat.id] =
        this.strip(inputs[this.state.activeChat.id]);

      return { inputs };
    }
  }

  stateWhitelist(changes: Chat['state']): boolean
  {
    if (
      changes.size ||
      changes.inputs ||
      changes.profile ||
      changes.activeChat
    )
      return true;
    
    return false;
  }

  componentDidMount(): void
  {
    super.componentDidMount();

    Keyboard.addListener('keyboardDidShow', this.keyboardShow);
    Keyboard.addListener('keyboardDidHide', this.keyboardHide);
  }

  componentWillUnmount(): void
  {
    super.componentWillUnmount();

    Keyboard.removeListener('keyboardDidShow', this.keyboardShow);
    Keyboard.removeListener('keyboardDidHide', this.keyboardHide);
  }

  keyboardProgress = new Animated.Value(0);

  // istanbul ignore next
  keyboardShow(): void
  {
    Animated.timing(this.keyboardProgress, {
      duration: 200,
      toValue: 1,
      easing: Easing.inOut(Easing.ease)
    // returns component which is used by the reanimated mocks while testing
    }).start(() => this);
  }

  // istanbul ignore next
  keyboardHide(): void
  {
    Animated.timing(this.keyboardProgress, {
      duration: 200,
      toValue: 0,
      easing: Easing.inOut(Easing.ease)
    // returns component which is used by the reanimated mocks while testing
    }).start(() => this);
  }

  strip(s: string): string
  {
    let striped = s;
    
    // filter emojis out of text
    striped = s?.replace(emojiRegex, '');

    return striped;
  }

  sendMessage(): void
  {
    const  { profile, activeChat, inputs } = this.state;

    // strip and trim
    const value = this.strip(inputs[activeChat.id])?.trim();

    // istanbul ignore next
    if (!value)
      return;

    const message: Message = {
      animate: true,
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

    // update store
    this.store.set({ inputs, activeChat });
  }

  onChange(text: string): void
  {
    const { inputs, activeChat } = this.state;

    inputs[activeChat.id] = text;

    this.store.set({ inputs });
  }

  render(): JSX.Element
  {
    const { size, profile, activeChat, inputs } = this.state;

    if (!activeChat?.id)
      return <View/>;

    const value = inputs[activeChat.id] ?? '';

    const width = this.keyboardProgress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ size.width - (sizes.windowMargin * 2), size.width ]
    });

    const margin = this.keyboardProgress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ sizes.windowMargin, 0 ]
    });

    const borderRadius = this.keyboardProgress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ sizes.topBarHeight + (sizes.windowMargin / 3), 0 ]
    });

    const renderMessage = ({ item, index }: { item: Message, index: number }) =>
    {
      // if the item is not message
      // then clone it (to assign it a key)
      // and return it as is (an already constructed element)
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

        <ChatMessage
          size={ size }
          self={ self }
          /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
          /* @ts-ignore */
          avatar={ avatar }
          message={ message }
        />
      </View>;
    };

    return <View testID={ 'v-chat' } style={ styles.container }>
      <View style={ styles.wrapper }>
        <FlatList
          testID={ 'v-messages' }
          inverted={ true }
          data={ this.messages }
          keyExtractor={ (item, index) => index.toString() }
          renderItem={ renderMessage }
        />
      </View>

      <Animated.View style={ {
        ...styles.input,
        
        // number is based on the padding
        // of the text input field itself
        height: sizes.topBarHeight + (sizes.windowMargin / 3),
        
        width,

        marginLeft: margin,
        marginRight: margin,

        borderRadius
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
      </Animated.View>
    </View>;
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },

  container: {
    backgroundColor: colors.blackBackground,
    height: '100%'
  },

  hint: {
    color: colors.greyText,
    fontSize: 13,

    marginVertical: sizes.windowMargin * 0.75,
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
    color: colors.whiteText,
    opacity: 0.8,

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
    
    marginTop: sizes.windowMargin / 2,
    marginBottom: sizes.windowMargin / 2
  },

  field: {
    flex: 1,

    color: colors.whiteText,
    fontSize: 16,

    paddingTop: sizes.windowMargin / 3,
    paddingBottom: sizes.windowMargin / 3,

    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin / 4
  },

  send: {
    alignItems: 'center',
    justifyContent: 'center',

    width: sizes.avatar,
    height: '100%',
    
    marginLeft: sizes.windowMargin / 4,
    marginRight: sizes.windowMargin / 2,

    borderRadius: sizes.avatar
  }
});

export default Chat;
