/* eslint-disable react-native/no-inline-styles */

import React from 'react';

import Animated, { Easing } from 'react-native-reanimated';

import { StoreComponent } from '../store';

class NavigationView extends StoreComponent<{
  testID: string,
  index: number
}, {
  index: number
}>
{
  constructor(props: NavigationView['props'])
  {
    super(props);
   
    this.progress = new Animated.Value(props.index === 0 ? 1 : 0);
  }

  progress: Animated.Value<number>;

  stateWhitelist(changes: NavigationView['state']): boolean
  {
    if (changes.index)
      return true;

    return false;
  }

  stateDidChange(state: NavigationView['state'], changes: NavigationView['state'], old: NavigationView['state']): void
  {
    const { index } = this.props;

    // start show page animation
    if (state.index === index && state.index !== old.index)
    {
      Animated.timing(this.progress, {
        duration: 125,
        toValue: 1,
        easing: Easing.circle
      }).start();
    }
    // start hide page animation
    else if (old.index === index && state.index !== old.index)
    {
      Animated.timing(this.progress, {
        duration: 125,
        toValue: 0,
        easing: Easing.circle
      }).start();
    }
  }

  render(): JSX.Element
  {
    const { index, testID } = this.props;

    const active = this.state.index === index;

    const opacity = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 0, 1 ]
    });

    const top = this.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 25, 0 ]
    });

    return <Animated.View
      testID={ testID }
      style={ {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top,
        opacity
      } }
      pointerEvents={ active ? 'box-none' : 'none' }
    >
      { this.props.children }
    </Animated.View>;
  }
}

export default NavigationView;
