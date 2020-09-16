import React from 'react';

import { StyleSheet, View, Text } from 'react-native';

import Animated from 'react-native-reanimated';

import Search from './Search';

import ChatAvatars from './ChatAvatars';

import { StoreComponent } from '../store';

import i18n from '../i18n';

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
  stateWhitelist(changes: TopBar['state']): boolean
  {
    if (
      changes.index
    )
      return true;
    
    return false;
  }

  render(): JSX.Element
  {
    let title;

    if (this.state.index === 0)
      title = i18n('inbox');
    else
      title = i18n('discover');

    const marginTop = this.props.bottomSheetNode.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ sizes.topBarBigMargin, sizes.topBarMiniMargin ]
    });

    return (
      <View>
        <Animated.View style={ {
          ...styles.container,
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
          <Search bottomSheetNode={ this.props.bottomSheetNode }/>
          <ChatAvatars holderNode={ this.props.holderNode } bottomSheetNode={ this.props.bottomSheetNode }/>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',

    height: sizes.topBarHeight
  },

  controls: {
    zIndex: depth.topBar,
    position: 'absolute',

    flexDirection: 'row',
    alignItems: 'center',
    
    backgroundColor: colors.blackBackground,

    right: 0,
    height: sizes.topBarHeight
  },

  title: {
    position: 'absolute',

    flex: 1,
    color: colors.whiteText,

    fontSize: 26,
    fontWeight: 'bold',

    marginLeft: sizes.windowMargin
  }
});

export default TopBar;
