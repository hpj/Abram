import React from 'react';

import { BackHandler, Clipboard, StyleSheet, View, Text } from 'react-native';

import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

import Animated, { Easing } from 'react-native-reanimated';

import type { Size, Message, InboxEntry } from '../types';

import Button from './Button';

import { StoreComponent } from '../store';

import { relativeDate } from '../utils';

import { sizes, responsive } from '../sizes';

import { depth } from '../depth';

import getTheme from '../colors';

declare const global: {
  __TEST__: boolean
};

const colors = getTheme();

class ChatContext extends StoreComponent<{
  holderNode: Animated.Value<number>
}, {
  size: Size,
  activeChat: InboxEntry,
  context: boolean,
  contextMessage: Message,
}>
{
  constructor()
  {
    super({
      context: false
    });

    // bind functions to use as callbacks
    
    this.onActive = this.onActive.bind(this);
    this.deactivate = this.deactivate.bind(this);
  }

  timestamp = Date.now()

  progress = new Animated.Value(0);

  clipboard(text?: string): void
  {
    if (text && text.length)
      Clipboard.setString(text);
  }

  onActive(message?: Message | 'deactivate'): void
  {
    // to stop users from spamming buttons
    if (Date.now() - this.timestamp > 250 || message === 'deactivate' || global.__TEST__)
      this.timestamp = Date.now();
    else
      return;

    const context = this.state.context ? false : true;

    if (context && (!message || message === 'deactivate'))
      return;
    
    if (context)
      BackHandler.addEventListener('hardwareBackPress', this.deactivate);
    else
      BackHandler.removeEventListener('hardwareBackPress', this.deactivate);

    // update store
    this.store.set({
      context,
      contextMessage: (context && message) ? message : this.state.contextMessage,
      holder: context
    }, () =>
    {
      Animated.timing(this.progress, {
        duration: context ? 200 : 300,
        toValue: context ? 1 : 0,
        easing: Easing.inOut(Easing.circle)
      }).start();
  
      Animated.timing(this.props.holderNode, {
        duration: 200,
        toValue: context ? 1 : 0,
        easing: Easing.linear
      }).start();
    });

  }

  deactivate(): boolean
  {
    this.onActive('deactivate');

    return true;
  }

  render(): JSX.Element
  {
    const { size } = this.state;

    const { activeChat, contextMessage } = this.state;

    const member = activeChat?.members?.find(member => member.uuid === contextMessage?.owner);

    const top = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ size.height, 0 ]
    });

    return (
      <Animated.View testID='v-chat-context' style={ {
        ...styles.wrapper,

        top,
        width: size.width,
        height: size.height
      } }>
        <View style={ styles.blockerWrapper }>
          <TouchableWithoutFeedback style={ styles.blockerContainer } onPress={ () => this.onActive() }/>
        </View>

        <View style={ styles.container }>
          {/* info */}
          <View style={ styles.info }>
            {/* eslint-disable-next-line react-native/no-inline-styles */}
            <View style={ { flex: 1, justifyContent: 'center' } }>
              <Text style={ styles.name }>{ member?.displayName }</Text>
              <Text style={ styles.time }>{ relativeDate(contextMessage?.timestamp, true) }</Text>
            </View>

            <Button
              borderless={ true }
              buttonStyle={ { ...styles.button, width: sizes.avatar * 1.2 } }
              icon={ { name: 'copy', size: sizes.icon / 1.2, color: colors.whiteText } }
              onPress={ () =>
              {
              // copy to clipboard
                this.clipboard(contextMessage?.text);

                // deactivate context menu
                this.deactivate();
              } }
            />
          </View>

          <Text
            numberOfLines={ 3 }
            ellipsizeMode={ 'tail' }
            style={ styles.message }
          >
            { contextMessage?.text }
          </Text>

        </View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,

    zIndex: depth.context,
    position: 'absolute'
  },

  blockerWrapper: {
    flex: 1,
    flexGrow: 1
  },

  blockerContainer: {
    height: '100%'
  },

  container: {
    backgroundColor: colors.contextBackground
  },

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
    justifyContent: 'center'
  },

  buttonText: {
    color: colors.whiteText,
    fontWeight: '700'
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
