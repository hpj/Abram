import React from 'react';

import PropTypes from 'prop-types';

import { Platform, View, TouchableNativeFeedback, TouchableOpacity, Text } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import getTheme from '../colors.js';

const colors = getTheme();

class Button extends React.Component
{
  render()
  {
    const Touchable = (Platform.OS === 'android') ? TouchableNativeFeedback : TouchableOpacity;

    const {
      backgroundStyle, badgeStyle, buttonStyle,
      textStyle, text, icon, borderless,
      activeOpacity, onPress
    } = this.props;

    return (
      <Touchable
        background={ TouchableNativeFeedback.Ripple(colors.ripple, borderless) }
        activeOpacity={ activeOpacity }
        onPress={ onPress }
      >
        <View style={ buttonStyle }>

          <View style={ backgroundStyle }>
            <View style={ badgeStyle }/>
          </View>

          {
            (icon) ? <Icon { ...icon }/> : undefined
          }

          {
            (text) ?  <Text style={ textStyle }>{ text }</Text> : undefined
          }

          {
            this.props.children
          }
         
        </View>
      </Touchable>
    );
  }
}

Button.propTypes = {
  backgroundStyle: PropTypes.object,
  badgeStyle: PropTypes.object,
  buttonStyle: PropTypes.object,
  textStyle: PropTypes.object,
  text: PropTypes.string,
  icon: PropTypes.object,
  borderless: PropTypes.bool,
  activeOpacity: PropTypes.bool,
  children: PropTypes.any,
  onPress: PropTypes.func
};

export default Button;
