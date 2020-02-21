import React from 'react';

import { StyleSheet, View, Text } from 'react-native';

import Search from './Search.js';

import ChatAvatars from './ChatAvatars.js';

import { getStore } from '../store.js';

import i18n from '../i18n.js';

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

  scaleFont(fontSize, standardHeight)
  {
    standardHeight = standardHeight || 1130;

    const size = (fontSize * this.state.size.height) / standardHeight;

    return Math.round(size);
  }

  render()
  {
    let title;

    if (this.state.index === 0)
      title = i18n('inbox');
    else
      title = i18n('discover');
    
    return (
      <View style={ styles.container }>
        <Text style={ { ...styles.title, fontSize: this.scaleFont(38) } }>
          { title }
        </Text>

        <Search/>

        <ChatAvatars/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',

    height: 52,

    marginTop: 10,
    marginLeft: 20,
    marginRight: 20
  },

  title: {
    flex: 1,
    color: colors.whiteText,
    fontWeight: 'bold'
  }
});

export default TopBar;
