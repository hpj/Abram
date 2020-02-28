import React from 'react';

import { StyleSheet, View } from 'react-native';

import getTheme from '../colors.js';

const colors = getTheme();

class Chat extends React.Component
{
  render()
  {
    return (
      <View style={ styles.container }>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteBackground
  }
});

export default Chat;
