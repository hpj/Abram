/* eslint-disable react-native/no-inline-styles */

import React from 'react';

import { View } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

class NavigationView extends React.Component<{
  testID: string,
  active: boolean
}>
{
  state = { animating: false };

  progress: Animated.Value<number> = new Animated.Value();

  componentDidMount(): void
  {
    const { active } = this.props;

    this.progress = new Animated.Value(active ? 1 : 0);
  }

  // TODO FIX change implementation
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps({ active }: { active: boolean }): void
  {
    if (active === this.props.active)
      return;
    
    this.setState({ animating: true }, () =>
    {
      Animated.timing(this.progress, {
        duration: 150,
        toValue: (active) ? 1 : 0,
        easing: Easing.linear
      }).start(({ finished }) =>
      {
        if (finished)
          this.setState({ animating: false });
      });
    });
  }

  render(): JSX.Element
  {
    const { testID, active } = this.props;

    const opacity =
      this.progress.interpolate({
        inputRange: [ 0, 1 ],
        outputRange: [ 0, 1 ]
      });
  
    return (
      <Animated.View
        testID={ testID }
        style={ {
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: opacity
        } }
        pointerEvents={ (active) ? 'box-none' : 'none' }
      >
        { (!this.state.animating && !active) ? undefined : this.props.children }
      </Animated.View>
    );
  }
}

export default NavigationView;
