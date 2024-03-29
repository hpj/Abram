import React from 'react';

import { BackHandler, Keyboard, StyleSheet, ScrollView } from 'react-native';

import Animated, { EasingNode } from 'react-native-reanimated';

import type { Size } from '../types';

import { StoreComponent } from '../store';

import { depth } from '../depth';

import getTheme from '../colors';

declare const global: {
  __TEST__: boolean
};

const colors = getTheme();

class Popup extends StoreComponent<{
  holderNode: Animated.Value<number>
}, {
  size: Size,
  popup: boolean,
  popupHidden: boolean,
  popupContent?: (() => JSX.Element)
}>
{
  constructor()
  {
    super({
      popup: false,
      popupHidden: true,
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
      changes.popup ||
      changes.popupHidden
    )
      return true;
    
    return false;
  }

  stateWillChange(newState: Popup['state']): Partial<Popup['state']> | void
  {
    if (typeof newState.popupContent === 'function')
    {
      return {
        // clone the element and add the deactivate function
        // to it so it is able to deactivate itself
        popupContent: React.cloneElement(newState.popupContent(), {
          deactivate: this.deactivate
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any
      };
    }
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
      popupHidden: false,
      holder: true,
      holderCallback: this.deactivate
    }, () =>
    {
      Animated.timing(this.props.holderNode, {
        duration: 150,
        toValue: 1,
        easing: EasingNode.linear
      }).start();

      Animated.timing(this.progress, {
        duration: 200,
        toValue: 1,
        easing: EasingNode.out(EasingNode.cubic)
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

    Keyboard.dismiss();

    BackHandler.removeEventListener('hardwareBackPress', this.deactivate);

    this.store.set({
      popup: false,
      holder: false,
      holderCallback: undefined
    }, () =>
    {
      Animated.timing(this.props.holderNode, {
        duration: 150,
        toValue: 0,
        easing: EasingNode.linear
      }).start();

      Animated.timing(this.progress, {
        duration: 200,
        toValue: 0,
        easing: EasingNode.inOut(EasingNode.circle)
      // returns component which is used by the reanimated mocks while testing
      }).start(() =>
      {
        if (!this.store.state.popup)
          this.store.set({
            popupHidden: true
          });

        return this;
      });
    });

    return true;
  }

  render(): JSX.Element
  {
    const { size, popupHidden, popupContent } = this.state;

    const bottom = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ -(size.height * 0.65), 0 ]
    });

    return <Animated.View testID={ 'v-popup' } style={ {
      ...styles.wrapper,

      bottom: bottom,
      width: size.width
    } }>
      <ScrollView style={ {
        ...styles.container,
        minHeight: size.height * 0.4,
        maxHeight: size.height * 0.65
      } }>
        { popupHidden ? undefined : popupContent }
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
    backgroundColor: colors.blackBackground
  }
});

export default Popup;
