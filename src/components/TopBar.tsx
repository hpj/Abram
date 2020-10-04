import React from 'react';

import { StyleSheet, View, Text } from 'react-native';

import Animated from 'react-native-reanimated';

import Search from './Search';

import ChatAvatars from './ChatAvatars';

import { StoreComponent } from '../store';

import { sizes } from '../sizes';

import { depth } from '../depth';

import getTheme from '../colors';

const colors = getTheme();

class TopBar extends StoreComponent<{
  holderNode: Animated.Value<number>,
  bottomSheetNode: Animated.Value<number>
}, {
  index: number
}>
{
  chatAvatarsRef: React.RefObject<ChatAvatars> = React.createRef()

  stateWhitelist(changes: TopBar['state']): boolean
  {
    if (changes.index)
      return true;
    
    return false;
  }

  render(): JSX.Element
  {
    const { index } = this.state;

    let title;

    if (index === 0)
      title = 'Inbox';
    else if (index === 1)
      title = 'Discover';
    else if (index === 2)
      title = 'Profile';
    else if (index === 3)
      title = 'Settings';

    const marginTop = this.props.bottomSheetNode.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ sizes.topBarBigMargin, sizes.topBarMiniMargin ]
    });

    return <View>
      <Animated.View style={ {
        ...styles.titleContainer,
        marginTop: marginTop
      } }>
        {/* eslint-disable-next-line react-native/no-inline-styles */}
        <Text style={ styles.title }>
          { title }
        </Text>
      </Animated.View>

      <Animated.View style={ {
        ...styles.controls,
        marginTop: marginTop
      } }>
        <Search holderNode={ this.props.holderNode } bottomSheetNode={ this.props.bottomSheetNode }/>
        <ChatAvatars ref={ this.chatAvatarsRef } holderNode={ this.props.holderNode } bottomSheetNode={ this.props.bottomSheetNode }/>
      </Animated.View>
    </View>;

    // return <Animated.View style={ {
    //     ...styles.container,
    //     marginTop
    //   } }>
    //     <View style={ styles.titleContainer }>
    //       <Text style={ styles.title }>{ title }</Text>
    //     </View>

    //     <View style={ styles.controls }>
    //       <Search holderNode={ this.props.holderNode } bottomSheetNode={ this.props.bottomSheetNode }/>
    //       <ChatAvatars ref={ this.chatAvatarsRef } holderNode={ this.props.holderNode } bottomSheetNode={ this.props.bottomSheetNode }/>
    //     </View>
    //   </Animated.View>;
  }
}

const styles = StyleSheet.create({
  // container: {
  //   zIndex: depth.topBar,
  //   flexDirection: 'row',

  //   height: sizes.topBarHeight
  // },

  titleContainer: {
    // flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',

    height: sizes.topBarHeight
  },

  title: {
    color: colors.whiteText,

    fontSize: 26,
    fontWeight: 'bold',

    marginLeft: sizes.windowMargin
  },

  controls: {
    zIndex: depth.topBar,
    position: 'absolute',

    flexDirection: 'row',
    alignItems: 'center',

    right: 0,
    height: sizes.topBarHeight
  }
});

export default TopBar;
