import React from 'react';

import { StyleSheet, View, TextInput } from 'react-native';

import Button from './Button.js';

import { getStore } from '../store.js';

import { sizes } from '../sizes';

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
    standardHeight = standardHeight || sizes.standardHeight;

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

    const searchBarWidth = (maximized) ?
      // window width
      this.state.size.width -
      // minus top bar margin
      (sizes.windowMargin * 2)  -
      // minus this container margin
      styles.container.marginLeft -
      // minus main avatar width
      sizes.avatar -
      // minus the rest of avatars width
      (sizes.avatar / 2) * (avatarsAmount - 1) :
      sizes.avatar;

    // negative search bar width + container width
    const searchBarLeft = (maximized) ? -searchBarWidth + sizes.avatar : 0;

    // search bar width - container width - margin
    const searchBarInputWidth = (maximized) ? searchBarWidth - sizes.avatar - (sizes.avatar / 2) : 0;

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
              icon={ { name: 'search', size: sizes.icon, color: colors.whiteText } }
              onPress={ this.maximizeSearch }
            /> :
            <Button
              testID={ 'tb-search-minimize' }
              buttonStyle={ styles.button }
              icon={ { name: 'delete', size: sizes.icon, color: colors.whiteText } }
              onPress={ this.minimizeSearch }
            />
        }

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    minWidth: sizes.avatar,
    height: sizes.avatar,

    marginLeft: 15,
    marginRight: 15
  },

  background: {
    position: 'absolute',
    
    backgroundColor: colors.roundIconBackground,
    
    height: sizes.avatar,
    borderRadius: sizes.avatar
  },

  input: {
    position: 'absolute',
    color: colors.whiteText,

    height: sizes.avatar,
    marginLeft: 15
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',

    width: sizes.avatar,
    height: sizes.avatar
  }
});

export default Search;
