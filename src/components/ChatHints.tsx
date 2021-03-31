import React from 'react';

import { StyleSheet, View, Text, Image } from 'react-native';

import type { Profile, InboxEntry } from '../types';

import { getStore } from '../store';

import getTheme from '../colors';

import { sizes } from '../sizes';

import Interests from './Interests';

import Demographic from './Demographic';

import Button from './Button';

const colors = getTheme();

export default class ChatHints extends React.Component<{
  user: Profile,
  profiles: Profile[]
}>
{
  setInput(message: string): void
  {
    const store = getStore();

    const { inputs, activeChat }: { inputs: Record<string, string>, activeChat: InboxEntry } = store.state;

    inputs[activeChat?.id] = message;

    store.set({ inputs });
  }

  render(): JSX.Element
  {
    const { user, profiles } = this.props;

    // group hints

    if (profiles.length > 1)
    {
      return <View>
        <View style={ styles.miniGroup }>
          {
            profiles.map((profile, i) =>
              <MiniProfile key={ i } profile={ profile }/>)
          }
        </View>
        
        <Interests user={ user } profiles={ profiles }/>
      </View>;
    }

    // normal hints

    const profile = profiles[0];

    return <View testID={ 'v-chat-hints' }>

      <Interests user={ user } profiles={ profiles }/>

      <Titles profile={ profile }/>

      <Demographic user={ user } profile={ profile }/>

      <View testID={ 'v-ice-breaker' }>
        {
          profile.iceBreakers?.slice(0, 2).map((question, i) =>
            <View key={ i } style={ styles.question }>
              <Text style={ styles.questionText }>{ question }</Text>
              <Button
                testID={ 'bn-ice-breaker' }
                borderless={ true }
                buttonStyle={ styles.questionIcon }
                icon={ { name: 'message-circle', size: sizes.icon * 0.85, color: colors.greyText } }
                onPress={ () => this.setInput(question) }
              />
            </View>)
        }
      </View>
    </View>;
  }
}

const Titles = (props: { profile: Profile }) =>
{
  const { profile } = props;

  return <View style={ styles.container }>
    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
    {/* @ts-ignore */}
    <Image style={ styles.avatar } source={ profile.avatar }/>
    
    <View>
      <Text style={ styles.displayName }>{ profile.fullName }</Text>
      <Text style={ styles.nickname }>{ profile.nickname }</Text>
    </View>

  </View>;
};

const MiniProfile = (props: { profile: Profile }) =>
{
  const { profile } = props;

  return <View style={ { ...styles.container, ...styles.miniContainer } }>
    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
    {/* @ts-ignore */}
    <Image style={ styles.miniAvatar } source={ profile.avatar }/>
    
    <View>
      <Text style={ styles.miniDisplayName }>{ profile.fullName }</Text>
      <Text style={ styles.miniNickname }>{ profile.nickname }</Text>
    </View>

  </View>;
};

const styles = StyleSheet.create({
  miniGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',
    marginHorizontal: sizes.windowMargin
  },

  container: {
    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 10,
    backgroundColor: colors.rectangleBackground,

    paddingHorizontal: sizes.windowMargin,
    paddingVertical: sizes.windowMargin * 0.85,

    marginVertical: sizes.windowMargin * 0.5,
    marginHorizontal: sizes.windowMargin
  },

  miniContainer: {
    marginVertical: 10,
    marginHorizontal: 0
  },

  avatar: {
    backgroundColor: colors.greyText,

    marginRight: sizes.windowMargin,

    width: 74,
    height: 74,

    borderRadius: 10
  },

  miniAvatar: {
    backgroundColor: colors.greyText,

    marginRight: sizes.windowMargin,

    width: 38,
    height: 38,

    borderRadius: 10
  },

  displayName: {
    fontSize: 12,
    color: colors.greyText
  },

  nickname: {
    color: colors.whiteText,

    fontSize: 18,
    fontWeight: 'bold'
  },

  miniDisplayName: {
    fontSize: 12,
    color: colors.greyText
  },

  miniNickname: {
    color: colors.whiteText,

    fontSize: 16,
    fontWeight: 'bold'
  },

  question: {
    flexDirection: 'row',
    alignItems: 'center',

    height: sizes.avatar * 1.35,

    borderRadius: 10,
    backgroundColor: colors.rectangleBackground,

    paddingVertical: sizes.windowMargin * 0.5,
    paddingHorizontal: sizes.windowMargin,

    marginVertical: sizes.windowMargin * 0.5,
    marginHorizontal: sizes.windowMargin
  },

  questionText: {
    flexGrow: 1,
    color: colors.whiteText,

    marginRight: sizes.windowMargin,

    fontSize: 14,
    fontWeight: 'bold'
  },

  questionIcon: {
    alignItems: 'center',
    justifyContent: 'center',

    width: sizes.avatar * 1,
    height: sizes.avatar * 1.5
  }
});