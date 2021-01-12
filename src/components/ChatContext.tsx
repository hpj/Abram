import React from 'react';

import { StyleSheet, View, Text } from 'react-native';

import Clipboard from 'expo-clipboard';

import type { Message, InboxEntry } from '../types';

import Button from './Button';

import { relativeDate } from '../utils';

import { sizes } from '../sizes';

import getTheme from '../colors';

const colors = getTheme();

class ChatContext extends React.Component<{
  activeChat: InboxEntry,
  message: Message,
  deactivate?: (() => void)
}>
{
  constructor(props: ChatContext['props'])
  {
    super(props);

    // bind functions to use as callbacks
    
    this.onClipboard = this.onClipboard.bind(this);
  }

  onClipboard(): void
  {
    const { message, deactivate } = this.props;

    if (message?.text?.length)
      Clipboard.setString(message.text);

    deactivate?.();
  }

  render(): JSX.Element
  {
    const { activeChat, message } = this.props;

    const member = activeChat?.members?.find(member => member.uuid === message?.owner);

    return <View testID={ 'v-chat-context' }>
      <View style={ styles.info }>

        {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={ { flex: 1, justifyContent: 'center' } }>
          <Text style={ styles.name }>{ member?.fullName }</Text>
          <Text style={ styles.time }>{ relativeDate(message?.createdAt, true) }</Text>
        </View>

        <Button
          borderless={ true }
          useAlternative={ true }
          buttonStyle={ styles.button }
          icon={ { name: 'copy', size: sizes.icon * 0.75, color: colors.whiteText } }
          onPress={ this.onClipboard }
        />
      </View>

      <Text
        numberOfLines={ 3 }
        ellipsizeMode={ 'tail' }
        style={ styles.message }
      >
        { message?.text }
      </Text>
    </View>;
  }
}

const styles = StyleSheet.create({
  info: {
    flexDirection: 'row',
    justifyContent: 'center',

    marginHorizontal: sizes.windowMargin,
    marginVertical: sizes.windowMargin
  },

  name: {
    marginRight: sizes.windowMargin,
    color: colors.whiteText,
    fontSize: 15
  },

  time: {
    marginRight: sizes.windowMargin,
    color: colors.greyText,
    fontSize: 13
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',

    width: sizes.avatar * 1.15,
    height: sizes.avatar * 1.15,

    backgroundColor: colors.iconBackground,
    borderRadius: sizes.avatar * 1.15
  },

  message: {
    marginHorizontal: sizes.windowMargin,
    
    marginTop: sizes.windowMargin / 2,
    marginBottom: sizes.windowMargin * 1.5,

    color: colors.greyText,
    fontSize: 15
  }
});

export default ChatContext;
