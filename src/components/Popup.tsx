import React from 'react';

import { BackHandler, StyleSheet, ScrollView } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

import type { Size } from '../types';

import { StoreComponent } from '../store';

import { depth } from '../depth';

import getTheme from '../colors';

declare const global: {
  __TEST__: boolean
};

const colors = getTheme();

class Popup extends StoreComponent<{
  holderNode: Animated.Value<number>,
  content: JSX.Element
}, {
  size: Size,
  popup: boolean
}>
{
  constructor()
  {
    super({
      popup: false,
      popupContent: undefined
    });

    // bind functions to use as callbacks

    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
  }

  timestamp = Date.now()

  progress = new Animated.Value(0);

  stateWhitelist(changes: Popup['state']): boolean
  {
    if (
      changes.size ||
      changes.popup
    )
      return true;
    
    return false;
  }

  stateDidChange(state: Popup['state'], changes: Popup['state'], old: Popup['state']): void
  {
    if (state.popup !== old.popup && state.popup === true)
      this.activate();
  }

  activate(): void
  {
    // istanbul ignore else
    // to stop users from spamming buttons
    if (Date.now() - this.timestamp > 350 || global.__TEST__)
      this.timestamp = Date.now();
    else
      return;

    BackHandler.addEventListener('hardwareBackPress', this.deactivate);

    // update store
    this.store.set({
      holder: true,
      holderCallback: this.deactivate
    }, () =>
    {
      Animated.timing(this.props.holderNode, {
        duration: 200,
        toValue: 1,
        easing: Easing.linear
      }).start();

      Animated.timing(this.progress, {
        duration: 200,
        toValue: 1,
        easing: Easing.inOut(Easing.circle)
      // returns component which is used by the reanimated mocks while testing
      }).start(() => this);
    });
  }

  deactivate(): boolean
  {
    // istanbul ignore else
    // to stop users from spamming buttons
    if (Date.now() - this.timestamp > 350 || global.__TEST__)
      this.timestamp = Date.now();
    else
      return true;

    BackHandler.removeEventListener('hardwareBackPress', this.deactivate);

    this.store.set({
      popup: false,
      holder: false,
      holderCallback: undefined
    }, () =>
    {
      Animated.timing(this.props.holderNode, {
        duration: 200,
        toValue: 0,
        easing: Easing.linear
      }).start();

      Animated.timing(this.progress, {
        duration: 300,
        toValue: 0,
        easing: Easing.inOut(Easing.circle)
      // returns component which is used by the reanimated mocks while testing
      }).start(() => this);
    });

    return true;
  }

  render(): JSX.Element
  {
    const { content } = this.props;

    const { size } = this.state;

    const bottom = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ -size.height, 0 ]
    });

    return <Animated.View testID={ 'v-popup' } style={ {
      ...styles.wrapper,

      bottom: bottom,
      width: size.width
    } }>
      <ScrollView style={ {
        ...styles.container,
        maxHeight: size.height * 0.65
      } }>
        {
          // clone the element and add the deactivate button to it so it can deactivate itself
          content ? React.cloneElement(content, {
            deactivate: this.deactivate
          }) : undefined
        }
      </ScrollView>
    </Animated.View>;
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'absolute',

    zIndex: depth.popup
  },

  container: {
    backgroundColor: colors.popupBackground
  }
});

export default Popup;
