/* eslint-disable react-native/no-inline-styles */

import React from 'react';

import PropTypes from 'prop-types';

import { View } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

class NavigationView extends React.Component
{
  constructor()
  {
    super();

    this.state = {  animating: false };
  }

  componentDidMount()
  {
    const { active } = this.props;

    this.progress = new Animated.Value((active) ? 1 : 0);
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps({ active })
  {
    if (!this.progress)
      return;

    if (active !== this.props.active)
    {
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
  }

  render()
  {
    const { active } = this.props;

    if (!this.progress)
      return <View/>;

    const opacity =
      this.progress.interpolate({
        inputRange: [ 0, 1 ],
        outputRange: [ 0, 1 ]
      });
  
    return (
      <Animated.View
        { ...this.props }
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

NavigationView.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.any
};

export default NavigationView;
