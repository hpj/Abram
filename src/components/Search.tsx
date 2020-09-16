import React from 'react';

import { StyleSheet, View, TextInput } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

import type { Size, InboxEntry } from '../types';

import Button from './Button';

import { StoreComponent } from '../store';

import { sizes } from '../sizes';

import getTheme from '../colors';

declare const global: {
  __TEST__: boolean
};

const colors = getTheme();

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

class Search extends StoreComponent<{
  bottomSheetNode: Animated.Value<number>
}, {
  size: Size,
  activeChat: InboxEntry,
  searchMaximized: boolean
}>
{
  timestamp = Date.now()

  progress = new Animated.Value(0);
  
  stateWhitelist(changes: Search['state']): boolean
  {
    if (
      changes.size ||
      changes.activeChat ||
      changes.searchMaximized
    )
      return true;
    
    return false;
  }

  onPress(maximize: boolean): void
  {
    // istanbul ignore else
    // to stop users from spamming buttons
    if (Date.now() - this.timestamp > 500 || global.__TEST__)
      this.timestamp = Date.now();
    else
      return;
    
    this.store.set({
      searchMaximized: maximize
    });

    Animated.timing(this.progress, {
      duration: 65,
      toValue: (maximize) ? 1 : 0,
      easing: Easing.linear
    }).start();
  }

  render(): JSX.Element
  {
    const { searchMaximized } = this.state;

    const avatarsAmount = Math.min(this.state.activeChat.members?.length - 1 || 0, 2);

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
      <Animated.View testID={ 'v-search' } style={ {
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
            !searchMaximized ?
              <Button
                testID={ 'bn-search-maximize' }
                borderless={ true }
                buttonStyle={ styles.button }
                icon={ { name: 'search', size: sizes.icon, color: colors.whiteText } }
                onPress={ () => this.onPress(true) }
              /> :
              <Button
                testID={ 'bn-search-minimize' }
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
