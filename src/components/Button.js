import React from 'react';

import PropTypes from 'prop-types';

import { Platform, View, TouchableNativeFeedback, TouchableOpacity, Text, Image } from 'react-native';

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
      textStyle, text, image, icon,
      onPress
    } = this.props;

    return (
      <Touchable
        background={ TouchableNativeFeedback.Ripple(colors.ripple, true) }
        onPress={ onPress }
      >
        <View style={ buttonStyle }>

          <View style={ backgroundStyle }>
            <View style={ badgeStyle }/>
          </View>

          {
            (image) ? <Image { ...image }/> : <View/>
          }

          {
            (icon) ? <Icon { ...icon }/> : <View/>
          }

          {
            (text) ?  <Text style={ textStyle }>{ text }</Text> : <View/>
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
  image: PropTypes.object,
  children: PropTypes.any,
  onPress: PropTypes.func
};

export default Button;
