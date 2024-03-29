import React from 'react';

import { StyleSheet, View, Text } from 'react-native';

import { formatDistanceStrict } from 'date-fns';

import type { InboxEntry } from '../types';

import { StoreComponent } from '../store';

import getTheme from '../colors';

const colors = getTheme();

class ChatHeader extends StoreComponent<unknown, {
  activeChat: InboxEntry
}>
{
  stateWhitelist(changes: ChatHeader['state']): boolean
  {
    if (changes.activeChat)
      return true;
    
    return false;
  }

  render(): JSX.Element
  {
    const { activeChat } = this.state;

    if (!activeChat?.id)
      return <View/>;

    let lastActive = '';

    const current = new Date();
    const last = activeChat.updatedAt;

    if (current.getTime() - last.getTime() <= 60 * 1000)
      lastActive = 'Active recently';
    else
      lastActive = `Active ${formatDistanceStrict(last, current)} ago`;

    return <View testID={ 'v-chat-header' } style={ styles.container }>
      <Text style={ styles.name }>{ activeChat.displayName }</Text>
      <Text style={ styles.time }>{ lastActive }</Text>
    </View>;
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
