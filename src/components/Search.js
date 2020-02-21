import React from 'react';

import { StyleSheet, View, TextInput } from 'react-native';

import Button from './Button.js';

import { getStore } from '../store.js';

import getTheme from '../colors.js';

/**
* @type { import('../store.js').default }
*/
let store;

const colors = getTheme();

class Search extends React.Component
{
  constructor()
  {
    super();

    // get store
    store = getStore('app');

    this.state = {
      maximized: false,
      ...store.mount(this).state
    };
    
    // bind functions to use as callbacks

    this.minimizeSearch = this.minimizeSearch.bind(this);
    this.maximizeSearch = this.maximizeSearch.bind(this);
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
    standardHeight = standardHeight || 1130;

    size = (size * this.state.size.height) / standardHeight;

    return Math.round(size);
  }

  minimizeSearch()
  {
    this.setState({
      maximized: false
    });
  }

  maximizeSearch()
  {
    this.setState({
      maximized: true
    });
  }

  render()
  {
    const { maximized } = this.state;

    const avatarsAmount = 1;

    const topBarMargin = 40;

    const avatarWidth = 38;
    const halfAvatarWidth = 38 / 2;

    const searchBarWidth = (maximized) ?
    // window width
      this.state.size.width -
      // minus top bar margin
      topBarMargin -
      // minus this container margin
      styles.container.marginLeft -
      // minus this container width
      // styles.container.minWidth -
      // minus main avatar width
      avatarWidth -
      // minus the rest of avatars width
      halfAvatarWidth * (avatarsAmount - 1) :
      avatarWidth;

    // negative search bar width + container width
    const searchBarLeft = (maximized) ? -searchBarWidth + avatarWidth : 0;

    // search bar width - container width - margin
    const searchBarInputWidth = (maximized) ? searchBarWidth - avatarWidth - halfAvatarWidth : 0;

    return (
      <View style={ styles.container }>

        <View style={ {
          ...styles.background,
          left: searchBarLeft,
          width: searchBarWidth
        } }/>

        <TextInput style={ {
          ...styles.input,
          fontSize: this.scale(24),
          left: searchBarLeft,
          width: searchBarInputWidth
        } }
        placeholder={ 'Search' }
        />

        {
          (!maximized) ?
            <Button
              testID={ 'tb-search-maximize' }
              buttonStyle={ styles.button }
              icon={ { name: 'search', size: 24, color: colors.whiteText } }
              onPress={ this.maximizeSearch }
            /> :
            <Button
              testID={ 'tb-search-minimize' }
              buttonStyle={ styles.button }
              icon={ { name: 'delete', size: 24, color: colors.whiteText } }
              onPress={ this.minimizeSearch }
            />
        }

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'purple',

    minWidth: 38,
    height: 38,

    marginLeft: 15,
    marginRight: 15
  },

  background: {
    position: 'absolute',
    
    backgroundColor: colors.roundIconBackground,
    
    height: 38,
    borderRadius: 38
  },

  input: {
    position: 'absolute',
    color: colors.whiteText,

    height: 38,
    marginLeft: 15
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',

    width: 38,
    height: 38
  }
});

export default Search;
