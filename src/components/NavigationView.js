/* eslint-disable react-native/no-inline-styles */

import React from 'react';

import PropTypes from 'prop-types';

import { StyleSheet, View } from 'react-native';

import getTheme from '../colors.js';

const colors = getTheme();

class NavigationView extends React.Component
{
  render()
  {
    const { active, color } = this.props;

    return (
      <View
        style={ {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          opacity: (active) ? 1 : 0,
          backgroundColor: color
        } }
        pointerEvents={ (active) ? 'box-none' : 'none' }
      >

      </View>
    );
  }
}

NavigationView.propTypes = {
  active: PropTypes.bool.isRequired
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: colors.whiteBackground
//   }
// });

export default NavigationView;
