/* eslint-disable react-native/no-inline-styles */

import React from 'react';

import PropTypes from 'prop-types';

import { View, Animated } from 'react-native';

// import Animated from 'react-native-reanimated';

class NavigationView extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      /** @type { Animated.Value } */
      progress: undefined
    };
  }

  componentDidMount()
  {
    const { active } = this.props;

    this.setState({
      animating: false,
      progress: new Animated.Value((active) ? 1 : 0)
    });
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps({ active })
  {
    const { progress } = this.state;
    
    if (!progress)
      return;

    if (active !== this.props.active)
    {
      this.setState({ animating: true }, () =>
      {
        Animated
          .timing(progress, {
            toValue: (active) ? 1 : 0,
            duration: 150,
            useNativeDriver: true
          })
          .start(() => this.setState({ animating: false }));
      });
    }
  }

  render()
  {
    const { active } = this.props;

    if (!this.state.progress)
      return <View/>;

    const opacity =
      this.state.progress.interpolate({
        inputRange: [ 0, 1 ],
        outputRange: [ 0, 1 ]
      });
    
    const scale =
    this.state.progress.interpolate({
      inputRange: [ 0, 1 ],
      outputRange: [ 0.8, 1 ]
    });
  
    return (
      <Animated.View
        style={ {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          opacity: opacity,
          transform: [
            {
              scaleX: scale
            },
            {
              scaleY: scale
            }
          ]
        } }
        pointerEvents={ (active) ? 'box-none' : 'none' }
      >
        { this.props.children }
      </Animated.View>
    );
  }
}

NavigationView.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.any
};

export default NavigationView;
