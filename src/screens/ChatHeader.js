import React from 'react';

import { StyleSheet, View, Text } from 'react-native';

import { formatDistanceStrict } from 'date-fns';

import { StoreComponent } from '../store.js';

import getTheme from '../colors.js';

const colors = getTheme();

class ChatHeader extends StoreComponent
{
  render()
  {
    const activeChat = this.state.activeChat;

    if (!activeChat.displayName)
      return <View/>;

    const lastMessageTime = `Active ${formatDistanceStrict(
      activeChat.messages[activeChat.messages.length - 1].timestamp,
      new Date()
    )} ago`;

    return (
      <View style={ styles.container }>
        <Text style={ styles.name }>{ activeChat.displayName }</Text>
        <Text style={ styles.time }>{ lastMessageTime }</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',

    backgroundColor: colors.blackBackground
  },

  name: {
    color: colors.whiteText,

    fontWeight: 'bold',
    fontSize: 15
  },

  time: {
    color: colors.greyText,
    fontSize: 13
  }
});

export default ChatHeader;
