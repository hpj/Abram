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
    const activeEntry = this.state.activeEntry;

    if (!activeEntry.displayName)
      return <View/>;

    const lastMessageTime = `Active ${formatDistanceStrict(
      activeEntry.messages[activeEntry.messages.length - 1].timestamp,
      new Date()
    )} ago`;

    return (
      <View style={ styles.container }>
        <Text style={ styles.name }>{ activeEntry.displayName }</Text>
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
