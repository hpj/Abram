import React from 'react';

import PropTypes from 'prop-types';

import { StyleSheet, View, Text } from 'react-native';

import Animated from 'react-native-reanimated';

import Search from './Search.js';

import ChatAvatars from './ChatAvatars.js';

import { StoreComponent } from '../store.js';

import i18n from '../i18n.js';

import { sizes } from '../sizes.js';

import { depth } from '../depth.js';

import getTheme from '../colors.js';

const colors = getTheme();

class TopBar extends StoreComponent
{
  render()
  {
    let title;

    if (this.state.index === 0)
      title = i18n('inbox');
    else
      title = i18n('discover');

    const marginTop = Animated.interpolate(this.props.bottomSheetNode, {
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
          <Text style={ {
            ...styles.title,
            opacity: (this.state.searchMaximized) ? 0 : 1
          } }>
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

TopBar.propTypes = {
  holderNode: PropTypes.object,
  bottomSheetNode: PropTypes.object
};

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
