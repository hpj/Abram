import React from 'react';

import PropTypes from 'prop-types';

import { StyleSheet, View, TextInput } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

import Button from './Button.js';

import { StoreComponent } from '../store.js';

import { sizes } from '../sizes';

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
      duration: 65,
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

    const avatarsAmount = Math.min(this.state.activeChat.members?.length - 1 || 1, 2);

    const searchBarMinWidth = sizes.avatar;

    // when the bottom sheet is not active
    // the search bar takes it's default value
    // since cht avatars are always 1
    const searchBarDefaultWidth =
    // window width
    this.state.size.width -
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

    const searchBarWidth = this.props.bottomSheetNode.interpolate({
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

    const searchBarInputWidth = this.props.bottomSheetNode.interpolate({
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
      <Animated.View testID='v-search' style={ {
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
        placeholderTextColor={ colors.placeholder }
        placeholder={ 'Search' }
        />

        <View style={ styles.wrapper }>
          {
            (!maximized) ?
              <Button
                testID='bn-search-maximize'
                borderless={ true }
                buttonStyle={ styles.button }
                icon={ { name: 'search', size: sizes.icon, color: colors.whiteText } }
                onPress={ () => this.onPress(true) }
              /> :
              <Button
                testID='bn-search-minimize'
                borderless={ true }
                // eslint-disable-next-line react-native/no-inline-styles
                buttonStyle={ styles.button }
                icon={ { name: 'x', size: sizes.icon, color: colors.whiteText } }
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
    
    backgroundColor: colors.iconBackground,
    
    height: sizes.avatar,
    borderRadius: sizes.avatar
  },

  input: {
    position: 'absolute',
    color: colors.whiteText,

    right: 0,
    height: sizes.avatar,
    
    fontSize: 16,
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
