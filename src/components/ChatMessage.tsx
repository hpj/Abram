import React from 'react';

import { StyleSheet, Text, Image, ImageSourcePropType } from 'react-native';

import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

import Animated, { EasingNode } from 'react-native-reanimated';

import type { Size, Message } from '../types';

import { getStore } from '../store';

import { sizes } from '../sizes';

import getTheme from '../colors';

import ChatContext from './ChatContext';

const colors = getTheme();

class ChatMessage extends React.Component<{
  size: Size,
  self: boolean,
  message: Message,
  avatar?: ImageSourcePropType
}>
{
  progress: Animated.Value<number> = new Animated.Value(1);

  componentDidUpdate(): void
  {
    const { message } = this.props;

    // animate the message appearing
    if (message.animate)
    {
      // delete the animate flag
      delete message.animate;

      this.progress.setValue(0);

      Animated.timing(this.progress, {
        duration: 125,
        toValue: 1,
        easing: EasingNode.inOut(EasingNode.linear)
      }).start();
    }
  }

  onPress(message: Message): void
  {
    const store = getStore();

    // istanbul ignore next
    if (store.state.popup)
      return;
    
    // open a popup containing the chat context
    store.set({
      popup: true,
      popupContent: () => <ChatContext activeChat={ store.state.activeChat } message={ message }/>
    });
  }

  render(): JSX.Element
  {
    const {
      size,
      self,
      avatar,
      message
    } = this.props;
    
    const bubbleWidth = size.width * sizes.chatBubbleMaxWidth;
    const bubbleTextWidth = bubbleWidth - (sizes.windowMargin * 2);
    const avatarBubbleTextWidth = bubbleTextWidth - sizes.chatAvatar - sizes.windowMargin;

    const opacity = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 0, 1 ]
    });

    const left = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 10, 0 ]
    });

    return <Animated.View style={ { left, opacity } }>
      <TouchableWithoutFeedback
        testID={ 'bn-context' }
        style={ {
          ...styles.message,
          ...(self ? styles.messageAlt : undefined),
          maxWidth: bubbleWidth
        } }
        onPress={ () => this.onPress(message) }
      >
        {
          avatar ?
            /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
            /* @ts-ignore */
            <Image style={ styles.avatar } source={ avatar }/> :
            /* <Image style={ styles.avatar } source={ { uri: avatar } }/> : */
            undefined
        }

        <Text style={ { ...styles.text, maxWidth: avatar ? avatarBubbleTextWidth : bubbleTextWidth } }>{ message.text }</Text>
      </TouchableWithoutFeedback>
    </Animated.View>;
  }
}

const styles = StyleSheet.create({
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
  }
});

export default ChatMessage;
