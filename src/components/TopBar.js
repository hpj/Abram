import React from 'react';

import PropTypes from 'prop-types';

import { StyleSheet, View, Text } from 'react-native';

import Animated from 'react-native-reanimated';

import Search from './Search.js';

import ChatAvatars from './ChatAvatars.js';

import { getStore } from '../store.js';

import i18n from '../i18n.js';

import { sizes } from '../sizes';

import getTheme from '../colors.js';

/**
* @type { import('../store.js').default }
*/
let store;

const colors = getTheme();

class TopBar extends React.Component
{
  constructor()
  {
    super();

    // get store
    store = getStore('app').mount(this);
  }

  componentDidMount()
  {
    store.subscribe(this);
  }

  componentWillUnmount()
  {
    store.unsubscribe(this);
  }

  scale(size, standardHeight)
  {
    standardHeight = standardHeight || sizes.standardHeight;

    size = (size * this.state.size.height) / standardHeight;

    return Math.round(size);
  }

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
      <Animated.View style={ {
        ...styles.container,
        marginTop: marginTop
      } }>
        <Text style={ { ...styles.title, fontSize: this.scale(34) } }>
          { title }
        </Text>

        <View style={ styles.controls }>
          <Search/>
          <ChatAvatars/>
        </View>
      </Animated.View>
    );
  }
}

TopBar.propTypes = {
  bottomSheetNode: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',

    height: sizes.topBarHeight,

    marginLeft: sizes.windowMargin,
    marginRight: sizes.windowMargin
  },

  controls: {
    position: 'absolute',

    flexDirection: 'row',
    alignItems: 'center',
    
    backgroundColor: colors.whiteBackground,

    right: 0,
    height: sizes.topBarHeight
  },

  title: {
    position: 'absolute',

    flex: 1,
    color: colors.whiteText,
    fontWeight: 'bold'
  }
});

export default TopBar;
