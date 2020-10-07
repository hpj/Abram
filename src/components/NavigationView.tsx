/* eslint-disable react-native/no-inline-styles */

import React from 'react';

import { View } from 'react-native';

import { StoreComponent } from '../store';

class NavigationView extends StoreComponent<{
  testID: string,
  index: number
}, {
  index: number
}>
{
  stateWhitelist(changes: NavigationView['state']): boolean
  {
    if (changes.index)
      return true;

    return false;
  }

  render(): JSX.Element
  {
    const { index, testID } = this.props;

    const active = this.state.index === index;

    return <View
      testID={ testID }
      style={ {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: active ? 1 : 0
      } }
      pointerEvents={ active ? 'box-none' : 'none' }
    >
      { this.props.children }
    </View>;
  }
}

export default NavigationView;
