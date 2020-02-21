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

  scaleFont(fontSize, standardHeight)
  {
    standardHeight = standardHeight || 1130;

    const size = (fontSize * this.state.size.height) / standardHeight;

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
    const avatarsAmount = 1;

    const topBarMargin = 40;

    const AvatarWidth = 38;
    const HalfAvatarWidth = 38 / 2;

    const searchBarWidth =
    // window width
    this.state.size.width -
    // minus top bar margin
    topBarMargin -
    // minus this container margin
    styles.container.marginLeft -
    // minus this container width
    // styles.container.minWidth -
    // minus main avatar width
    AvatarWidth -
    // minus the rest of avatars width
    HalfAvatarWidth * (avatarsAmount - 1) +
    // add some padding
    5;

    // search bar width + container width + padding
    const searchBarLeft = -searchBarWidth + AvatarWidth + 5;

    // search bar width - container width - margin
    const searchBarInputWidth = searchBarWidth - AvatarWidth - HalfAvatarWidth;

    return (
      <View style={ styles.container }>

        <View style={ {
          ...styles.background,
          // left: searchBarLeft,
          // width: searchBarWidth
        } }/>

        {/* <TextInput style={ {
          ...styles.input,
          fontSize: this.scaleFont(24),
          left: searchBarLeft,
          width: searchBarInputWidth
        } }
        placeholder={ 'Search' }
        /> */}

        {
          (!this.state.maximized) ?
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
    
    width: 38,
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