import React from 'react';

import { StyleSheet, TextInput } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

import Button from './Button.js';

import { getStore } from '../store.js';

import { sizes } from '../sizes';

import getTheme from '../colors.js';

/**
* @type { import('../store.js').default }
*/
let store;

const colors = getTheme();

Animated.TextInput = Animated.createAnimatedComponent(TextInput);

class Search extends React.Component
{
  constructor()
  {
    super();

    // get store
    store = getStore('app');

    this.state = {
      maximized: false,
      ...store.state
    };

    this.progress = new Animated.Value(0);
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

  onPress(maximize)
  {
    this.setState({
      maximized: maximize
    });

    Animated.timing(this.progress, {
      duration: 100,
      toValue: (maximize) ? 1 : 0,
      easing: Easing.linear
    }).start();
  }

  render()
  {
    const { maximized } = this.state;

    const avatarsAmount = 1;

    const searchBarMinWidth = sizes.avatar;

    const searchBarMaxWidth =
    // window width
    this.state.size.width -
    // minus top bar margin
    (sizes.windowMargin * 2)  -
    // minus this container margin
    styles.container.marginLeft -
    // minus main avatar width
    sizes.avatar -
    // minus the rest of avatars width
    (sizes.avatar / 2) * (avatarsAmount - 1) +
    // add offset
    1;

    const searchBarWidth = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ searchBarMinWidth, searchBarMaxWidth ]
    });

    const searchBarInputLeft = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 0, sizes.avatar ]
    });

    const searchBarInputWidth = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [
        0,
        // search bar width - container width - margin
        searchBarMaxWidth - sizes.avatar - (sizes.avatar / 2)
      ]
    });

    return (
      <Animated.View style={ {
        ...styles.container,
        width: searchBarWidth
      } }>

        <Animated.View style={ {
          ...styles.background,
          width: searchBarWidth
        } }/>

        <Animated.TextInput style={ {
          ...styles.input,
          fontSize: this.scale(24),
          left: searchBarInputLeft,
          width: searchBarInputWidth
        } }
        placeholder={ 'Search' }
        />

        {
          (!maximized) ?
            <Button
              testID={ 'tb-search-maximize' }
              borderless={ true }
              buttonStyle={ styles.button }
              icon={ { name: 'search', size: sizes.icon, color: colors.whiteText } }
              onPress={ () => this.onPress(true) }
            /> :
            <Button
              testID={ 'tb-search-minimize' }
              borderless={ true }
              buttonStyle={ styles.button }
              icon={ { name: 'delete', size: sizes.icon, color: colors.whiteText } }
              onPress={ () => this.onPress(false) }
            />
        }
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    zIndex: 3,
    flexDirection: 'row-reverse',

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

    height: sizes.avatar
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',

    width: sizes.avatar,
    height: sizes.avatar
  }
});

export default Search;
