import React from 'react';

import PropTypes from 'prop-types';

import { StyleSheet, View, TextInput } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

import Button from './Button.js';

import { StoreComponent } from '../store.js';

import { screen, sizes } from '../sizes';

import getTheme from '../colors.js';

const colors = getTheme();

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

class Search extends StoreComponent
{
  constructor()
  {
    super(undefined, {
      maximized: false
    });

    this.progress = new Animated.Value(0);
  }
  
  onPress(maximize)
  {
    this.setState({ maximized: maximize });

    if (!maximize)
    {
      this.store.set({
        searchMaximized: maximize
      });
    }

    Animated.timing(this.progress, {
      duration: 100,
      toValue: (maximize) ? 1 : 0,
      easing: Easing.linear
    }).start((finished) =>
    {
      if (finished && maximize)
      {
        this.store.set({
          searchMaximized: maximize
        });
      }
    });
  }

  render()
  {
    const { maximized } = this.state;

    const avatarsAmount = Math.min(Object.keys(this.state.activeEntry.avatars || {}).length || 1, 2);

    const searchBarMinWidth = sizes.avatar;

    const searchBarDefaultWidth =
    // window width
    screen.width -
    // minus top bar margin
    (sizes.windowMargin * 2)  -
    // minus this container margin
    styles.container.marginLeft -
    // minus main avatar width
    sizes.avatar -
    // add offset
    1;

    const searchBarMaxWidth =
    searchBarDefaultWidth -
    // minus the rest of avatars width
    (sizes.avatar / 2) * (avatarsAmount);

    const searchBarWidth = Animated.interpolate(this.props.bottomSheetNode, {
      inputRange: [ 0, 1 ],
      outputRange: [
        this.progress.interpolate({
          inputRange: [ 0, 1 ],
          outputRange: [ searchBarMinWidth, searchBarMaxWidth ]
        }),
        this.progress.interpolate({
          inputRange: [ 0, 1 ],
          outputRange: [ searchBarMinWidth, searchBarDefaultWidth ]
        })
      ]
    });

    const searchBarInputWidth = Animated.interpolate(this.props.bottomSheetNode, {
      inputRange: [ 0, 1 ],
      outputRange: [
        this.progress.interpolate({
          inputRange: [ 0, 1 ],
          outputRange: [ 0, searchBarMaxWidth - sizes.avatar - (sizes.avatar / 2) - 5 ]
        }),
        this.progress.interpolate({
          inputRange: [ 0, 1 ],
          outputRange: [ 0, searchBarDefaultWidth - sizes.avatar - (sizes.avatar / 2) - 5 ]
        })
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

        <AnimatedTextInput style={ {
          ...styles.input,
          width: searchBarInputWidth
        } }
        placeholder={ 'Search' }
        />

        <View style={ styles.wrapper }>
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
                // eslint-disable-next-line react-native/no-inline-styles
                buttonStyle={ { ...styles.button, marginLeft: -5 } }
                icon={ { name: 'delete', size: sizes.icon, color: colors.whiteText } }
                onPress={ () => this.onPress(false) }
              />
          }
        </View>

      </Animated.View>
    );
  }
}

Search.propTypes = {
  holderNode: PropTypes.object,
  bottomSheetNode: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
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

    right: 0,
    height: sizes.avatar,
    
    fontSize: 18,
    marginRight: 15
  },

  wrapper: {
    zIndex: 0,
    
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: sizes.avatar
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',

    width: sizes.avatar,
    height: sizes.avatar
  }
});

export default Search;
