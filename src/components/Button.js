import React from 'react';

import PropTypes from 'prop-types';

import { Platform, View, TouchableNativeFeedback, TouchableOpacity, Text } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

class Button extends React.Component
{
  render()
  {
    const Touchable = (Platform.OS === 'android') ? TouchableNativeFeedback : TouchableOpacity;

    const { backgroundStyle, badgeStyle, buttonStyle, textStyle, text, icon,  onPress } = this.props;

    return (
      <Touchable
        onPress={ onPress }
      >
        <View style={ buttonStyle }>

          <View style={ backgroundStyle }>
            <View style={ badgeStyle }/>
          </View>

          {
            (icon) ? <Icon { ...icon }/> : <View/>
          }

          {
            (text) ?  <Text style={ textStyle }>{ text }</Text> : <View/>
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
  onPress: PropTypes.func
};

export default Button;
